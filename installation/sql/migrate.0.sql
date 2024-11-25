alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    alter column "role" set not null;

alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    rename column "role" to role_id;

alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    alter column "user" set not null;

alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    rename column "user" to user_id;

