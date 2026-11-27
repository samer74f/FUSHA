-- Read-only catalog report. Returns one result set and reads no application rows.
with requested_tables (table_name) as (
  values ('trips'), ('trip_participants'), ('trip_budget_items'), ('trip_equipment'), ('trip_expenses'), ('profiles')
), target_tables as (
  select requested.table_name, relation.oid, relation.relrowsecurity, relation.relforcerowsecurity
  from requested_tables as requested
  left join pg_catalog.pg_class as relation
    on relation.relnamespace = 'public'::regnamespace
    and relation.relname = requested.table_name
    and relation.relkind in ('r', 'p')
), api_roles as (
  select oid, rolname
  from pg_catalog.pg_roles
  where rolname in ('anon', 'authenticated', 'service_role')
), report (section_order, section, object, name, position, details) as (
  select 1, 'table', target.table_name, target.table_name, 0,
    jsonb_build_object('exists', target.oid is not null, 'rls_enabled', target.relrowsecurity,
      'rls_forced', target.relforcerowsecurity)
  from target_tables as target

  union all

  select 2, 'column', target.table_name, attribute.attname, attribute.attnum,
    jsonb_build_object(
      'type', pg_catalog.format_type(attribute.atttypid, attribute.atttypmod),
      'not_null', attribute.attnotnull,
      'default', pg_catalog.pg_get_expr(column_default.adbin, column_default.adrelid),
      'identity', nullif(attribute.attidentity, ''),
      'generated', nullif(attribute.attgenerated, ''),
      'enum_values', (
        select jsonb_agg(enum.enumlabel order by enum.enumsortorder)
        from pg_catalog.pg_enum as enum
        where enum.enumtypid = attribute.atttypid
      )
    )
  from target_tables as target
  join pg_catalog.pg_attribute as attribute on attribute.attrelid = target.oid
  left join pg_catalog.pg_attrdef as column_default
    on column_default.adrelid = target.oid and column_default.adnum = attribute.attnum
  where attribute.attnum > 0 and not attribute.attisdropped

  union all

  select 3, 'constraint', target.table_name, constraint_row.conname, 0,
    jsonb_build_object('definition', pg_catalog.pg_get_constraintdef(constraint_row.oid),
      'validated', constraint_row.convalidated)
  from target_tables as target
  join pg_catalog.pg_constraint as constraint_row on constraint_row.conrelid = target.oid

  union all

  select 4, 'index', target.table_name, index_relation.relname, 0,
    jsonb_build_object('definition', pg_catalog.pg_get_indexdef(table_index.indexrelid),
      'valid', table_index.indisvalid)
  from target_tables as target
  join pg_catalog.pg_index as table_index on table_index.indrelid = target.oid
  join pg_catalog.pg_class as index_relation on index_relation.oid = table_index.indexrelid

  union all

  select 5, 'rls_policy', target.table_name, policy.policyname, 0,
    jsonb_build_object('command', policy.cmd, 'roles', policy.roles, 'mode', policy.permissive,
      'using', policy.qual, 'with_check', policy.with_check)
  from target_tables as target
  join pg_catalog.pg_policies as policy
    on policy.schemaname = 'public' and policy.tablename = target.table_name

  union all

  select 6, 'table_access', target.table_name, api_role.rolname, 0,
    jsonb_build_object(
      'select_any_column', pg_catalog.has_any_column_privilege(api_role.oid, target.oid, 'SELECT'),
      'insert_any_column', pg_catalog.has_any_column_privilege(api_role.oid, target.oid, 'INSERT'),
      'update_any_column', pg_catalog.has_any_column_privilege(api_role.oid, target.oid, 'UPDATE'),
      'delete', pg_catalog.has_table_privilege(api_role.oid, target.oid, 'DELETE')
    )
  from target_tables as target
  cross join api_roles as api_role
  where target.oid is not null

  union all

  select 7, 'trigger', target.table_name, table_trigger.tgname, 0,
    jsonb_build_object('function', table_trigger.tgfoid::regprocedure::text, 'enabled_mode', table_trigger.tgenabled)
  from target_tables as target
  join pg_catalog.pg_trigger as table_trigger on table_trigger.tgrelid = target.oid
  where not table_trigger.tgisinternal

  union all

  select 8, 'routine', 'public', routine.proname, 0,
    jsonb_build_object(
      'kind', case routine.prokind when 'p' then 'procedure' else 'function' end,
      'arguments', pg_catalog.pg_get_function_arguments(routine.oid),
      'identity_arguments', pg_catalog.pg_get_function_identity_arguments(routine.oid),
      'result', pg_catalog.pg_get_function_result(routine.oid),
      'security_definer', routine.prosecdef,
      'public_execute', exists (
        select 1
        from pg_catalog.aclexplode(coalesce(routine.proacl, pg_catalog.acldefault('f', routine.proowner))) as grant_row
        where grant_row.grantee = 0 and grant_row.privilege_type = 'EXECUTE'
      ),
      'api_execute_roles', coalesce((
        select jsonb_agg(api_role.rolname order by api_role.rolname)
        from api_roles as api_role
        where pg_catalog.has_schema_privilege(api_role.oid, routine.pronamespace, 'USAGE')
          and pg_catalog.has_function_privilege(api_role.oid, routine.oid, 'EXECUTE')
      ), '[]'::jsonb)
    )
  from pg_catalog.pg_proc as routine
  where routine.pronamespace = 'public'::regnamespace and routine.prokind in ('f', 'p')
    and (routine.proname ~* '(^|_)trips?(_|$)' or exists (
      select 1
      from pg_catalog.pg_trigger as table_trigger
      join target_tables as target on target.oid = table_trigger.tgrelid
      where not table_trigger.tgisinternal and table_trigger.tgfoid = routine.oid
    ))
)
select section, object, name, details
from report
order by object, section_order, position, name, details ->> 'identity_arguments';
