-------------------------------------------------
-- Date:                2024-10-25, 1:52:57 p.m.
-- Version:             1.3.52
-- Script:              Create database schema, objects and tables
-------------------------------------------------

BEGIN;

create schema if not exists "@{SCHEMA}";

CREATE EXTENSION if not exists pgcrypto;

-------------------------------------------------
-- Tables
-------------------------------------------------
create table if not exists "@{SCHEMA}".@{TABLE_ERROR}
(
	"id" serial not null,
	"user_id" text,
	"gcode_id" text
);

create table if not exists "@{SCHEMA}".@{TABLE_ACCESS}
(
	"id" serial not null,
	"fingerprint" text,
	"ip" text,
	"datetime" timestamp with time zone default CURRENT_TIMESTAMP,
	"resource" text,
	"method" text,
	"bv" text,
	"fv" text,
	"user_id" integer,
	"logged_in" boolean default false
);

create table if not exists "@{SCHEMA}".@{TABLE_PREFERENCES}
(
	"id" serial not null,
	"name" text not null,
	"user_id" integer not null,
	"value" json,
	constraint preferences_pk
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_MIGRATIONS}
(
	"id" serial not null,
	"version" text,
	"datetime" timestamp without time zone default CURRENT_TIMESTAMP,
	"rollback" integer,
	constraint migrations_pkey
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_AUTHS}
(
	"id" serial not null,
	"auth_id" text not null,
	"provider" text not null,
	"email" text,
	"verified" boolean not null default false,
	"displayname" text,
	"active" boolean not null default true,
	"lastname" text,
	"firstname" text,
	"avatar" text,
	constraint auths_pk
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_LOGINS}
(
	"id" serial not null,
	"auth_id" integer not null,
	"date" timestamp with time zone default CURRENT_TIMESTAMP,
	"fingerprint" text,
	"ip" text,
	"type" text not null,
	constraint logins_pk
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_USERS}
(
	"id" serial not null,
	"primary_auth_id" integer not null,
	"active" boolean not null default true,
	constraint users_pk
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_USER_AUTHS}
(
	"id" serial not null,
	"user_id" integer not null,
	"auth_id" integer not null,
	constraint user_auths_pk
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_ROLE_ACL}
(
	"id" serial not null,
	"role" integer not null,
	"acl" integer not null,
	constraint role_acl_pkey
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_USER_ROLE}
(
	"id" serial not null,
	"role" integer,
	"user" integer,
	constraint user_role_pkey
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_ROLE}
(
	"id" serial not null,
	"name" text not null,
	"description" text,
	constraint role_pkey
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_ACL}
(
	"id" serial not null,
	"name" text,
	"resource" text not null,
	"permission" text default 'deny'::text,
	"method" text not null,
	"category" text not null,
	"description" text,
	constraint acl_pkey
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_API_KEYS}
(
	"id" serial not null,
	"value" text not null,
	"creation" timestamp with time zone default CURRENT_TIMESTAMP,
	"name" text,
	"public_id" text default gen_random_uuid(),
	"last_used" timestamp with time zone,
	constraint api_keys_pkey
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_API_KEYS_ACL}
(
	"id" serial not null,
	"api_key_id" integer,
	"acl_id" integer,
	constraint api_keys_acl_pkey
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_DEPLOYMENTS}
(
	"id" serial not null,
	"backend_version" text not null,
	"backend_release" integer not null,
	"database_version_id" integer not null,
	"frontend_filename" text not null,
	"previous_release_id" integer,
	"creation" timestamp with time zone default CURRENT_TIMESTAMP,
	constraint deployments_pk
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_USERS_API_KEYS}
(
	"id" serial not null,
	"api_key_id" integer,
	"user_id" integer,
	constraint users_api_keys_pk
        primary key(id)
);


create table if not exists "@{SCHEMA}".@{TABLE_AUTH_TOKENS}
(
	"id" serial not null,
	"auth_id" integer not null,
	"expiration" timestamp with time zone not null default CURRENT_TIMESTAMP,
	"value" text not null,
	constraint auth_tokens_pk
        primary key(id)
);

create table if not exists "@{SCHEMA}".@{TABLE_TOKENS}
(
	"id" serial not null,
	"expiration" timestamp with time zone default CURRENT_TIMESTAMP,
	"value" text not null default gen_random_uuid(),
	"max_usage" integer default 1,
	"usage" integer default 0,
	"tag" json,
	constraint tokens_pk
        primary key(id)
);



-------------------------------------------------
-- Foreign keys
-------------------------------------------------
alter table "@{SCHEMA}".@{TABLE_API_KEYS_ACL}
    add constraint acl_fk
        foreign key ("acl_id") references "@{SCHEMA}".@{TABLE_ACL} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_API_KEYS_ACL}
    add constraint api_key_fk
        foreign key ("api_key_id") references "@{SCHEMA}".@{TABLE_API_KEYS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_AUTH_TOKENS}
    add constraint auth_id_fk
        foreign key ("auth_id") references "@{SCHEMA}".@{TABLE_AUTHS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_LOGINS}
    add constraint auth_id_fk
        foreign key ("auth_id") references "@{SCHEMA}".@{TABLE_AUTHS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_USER_AUTHS}
    add constraint auth_id_fk
        foreign key ("auth_id") references "@{SCHEMA}".@{TABLE_AUTHS} ("id")
            on delete cascade;


alter table "@{SCHEMA}".@{TABLE_DEPLOYMENTS}
    add constraint deployments_database_version_id_fkey
        foreign key ("database_version_id") references "@{SCHEMA}".@{TABLE_MIGRATIONS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_DEPLOYMENTS}
    add constraint deployments_deployments_id_fk
        foreign key ("previous_release_id") references "@{SCHEMA}".@{TABLE_DEPLOYMENTS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_MIGRATIONS}
    add constraint migrations_rollback_id_fk
        foreign key ("rollback") references "@{SCHEMA}".@{TABLE_MIGRATIONS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_PREFERENCES}
    add constraint preferences_users_id_fk
        foreign key ("user_id") references "@{SCHEMA}".@{TABLE_USERS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_USERS}
    add constraint prim_auth_id_fk
        foreign key ("primary_auth_id") references "@{SCHEMA}".@{TABLE_AUTHS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_ROLE_ACL}
    add constraint role_acl_acl_id_fk
        foreign key ("acl") references "@{SCHEMA}".@{TABLE_ACL} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_ROLE_ACL}
    add constraint role_acl_role_id_fk
        foreign key ("role") references "@{SCHEMA}".@{TABLE_ROLE} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_USER_AUTHS}
    add constraint user_id_fk
        foreign key ("user_id") references "@{SCHEMA}".@{TABLE_USERS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    add constraint user_role_role_id_fk
        foreign key ("role") references "@{SCHEMA}".@{TABLE_ROLE} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    add constraint user_role_users_id_fk
        foreign key ("user") references "@{SCHEMA}".@{TABLE_USERS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_USERS_API_KEYS}
    add constraint users_api_keys_api_keys_id_fk
        foreign key ("api_key_id") references "@{SCHEMA}".@{TABLE_API_KEYS} ("id")
            on delete cascade;

alter table "@{SCHEMA}".@{TABLE_USERS_API_KEYS}
    add constraint users_api_keys_users_id_fk
        foreign key ("user_id") references "@{SCHEMA}".@{TABLE_USERS} ("id")
            on delete cascade;



-------------------------------------------------
-- Indexes
-------------------------------------------------
create  index if not exists acl_category_index
            on "@{SCHEMA}".@{TABLE_ACL} ("category");

create  index if not exists acl_method_index
            on "@{SCHEMA}".@{TABLE_ACL} ("method");

create unique index if not exists acl_name_key
            on "@{SCHEMA}".@{TABLE_ACL} ("name");

create  index if not exists acl_permission_index
            on "@{SCHEMA}".@{TABLE_ACL} ("permission");

create  index if not exists acl_resource_index
            on "@{SCHEMA}".@{TABLE_ACL} ("resource");

create unique index if not exists api_keys_public_id_key
            on "@{SCHEMA}".@{TABLE_API_KEYS} ("public_id");

create unique index if not exists api_keys_value_key
            on "@{SCHEMA}".@{TABLE_API_KEYS} ("value");

create  index if not exists api_keys_acl_acl_id_index
            on "@{SCHEMA}".@{TABLE_API_KEYS_ACL} ("acl_id");

create  index if not exists api_keys_acl_api_key_id_index
            on "@{SCHEMA}".@{TABLE_API_KEYS_ACL} ("api_key_id");

create unique index if not exists auths_unique_id
            on "@{SCHEMA}".@{TABLE_AUTHS} ("auth_id", "provider");

create unique index if not exists logins_id_uindex
            on "@{SCHEMA}".@{TABLE_LOGINS} ("id");

create unique index if not exists migrations_version_uindex
            on "@{SCHEMA}".@{TABLE_MIGRATIONS} ("version");

create unique index if not exists preferences_id_uindex
            on "@{SCHEMA}".@{TABLE_PREFERENCES} ("id");

create unique index if not exists preferences_pk_2
            on "@{SCHEMA}".@{TABLE_PREFERENCES} ("name", "user_id");

create unique index if not exists role_name_key
            on "@{SCHEMA}".@{TABLE_ROLE} ("name");

create unique index if not exists value_unique
            on "@{SCHEMA}".@{TABLE_TOKENS} ("value");

create unique index if not exists user_auths_user_id_auth_id_uindex
            on "@{SCHEMA}".@{TABLE_USER_AUTHS} ("auth_id", "user_id");

COMMIT;
