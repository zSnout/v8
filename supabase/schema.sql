

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_story"("name" "text", "group_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN

if (select auth.uid()) IS NULL then
  raise exception 'User must be logged in to create a story.';
end if;

insert into
  "StoryGroup" (manager, name, id)
values
  (auth.uid(), name, group_id);

INSERT INTO "StoryMemberStats" ("group", "user") VALUES (group_id, auth.uid());

END;
$$;


ALTER FUNCTION "public"."create_story"("name" "text", "group_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_thread"("group_id" bigint, "content_new" "text", "thread_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin IF NOT EXISTS (
  SELECT
    1
  FROM
    "public"."StoryMemberRaw"
  WHERE
    "group" = "group_id"
    AND "user" = auth.uid ()
) THEN RAISE EXCEPTION 'User is not a member of the story';

END IF;

IF NOT EXISTS (
  SELECT
    gems
  FROM
    "public"."StoryMemberStats"
  WHERE
    "group" = "group_id"
    AND "user" = auth.uid ()
    AND gems >= 10
) THEN RAISE EXCEPTION 'User does not have enough gems';

END IF;

INSERT INTO
  "public"."StoryThread" (author, "group", id)
VALUES
  (auth.uid (), group_id, thread_id);

INSERT INTO
  "public"."StoryContrib" (author, content, thread)
VALUES
  (auth.uid (), content_new, thread_id);

UPDATE "public"."StoryMemberStats"
SET
  "gems" = "gems" - 10,
  stat_contribs = stat_contribs + 1,
  stat_last_contrib = now(),
  stat_unique_thread_contribs = stat_unique_thread_contribs + 1,
  stat_threads_created = stat_threads_created + 1
WHERE
  "group" = "group_id"
  AND "user" = auth.uid ();

END;
$$;


ALTER FUNCTION "public"."create_thread"("group_id" bigint, "content_new" "text", "thread_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."full_stats"("group_id" bigint) RETURNS TABLE("gems" integer, "stat_contribs" integer, "stat_last_contrib" timestamp without time zone, "stat_threads_completed" integer, "stat_threads_created" integer, "stat_unique_thread_contribs" integer, "username" "text", "blocked_on" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN

if (select auth.uid()) IS NULL then
  raise exception 'User must be logged in to fetch story statistics.';
end if;

if not (exists (select 1 from "StoryMemberRaw" where "user" = (select auth.uid()) AND "group" = group_id)) then
  raise exception 'User is not a member of this story.';
end if;

return query select
  "StoryMemberStats".gems as gems,
  "StoryMemberStats".stat_contribs as stat_contribs,
  "StoryMemberStats".stat_last_contrib as stat_last_contrib,
  "StoryMemberStats".stat_threads_completed as stat_threads_completed,
  "StoryMemberStats".stat_threads_created as stat_threads_created,
  "StoryMemberStats".stat_unique_thread_contribs as stat_unique_thread_contribs,
  "User".username as username,
  (
    select
      count("StoryThread".id)
    from
      "StoryThread"
    where
      complete = false AND
      "group" = "group_id" AND
      "user" in (
        select
          "StoryContrib".author
        from
          "StoryContrib"
        where
          "StoryContrib".thread = "StoryThread".id
        order by "StoryContrib".id desc
        limit 3
      )
  ) as blocked_on
from
  "StoryMemberStats"
join
  "User" on "User".id = "StoryMemberStats"."user"
where
  "StoryMemberStats"."group" = group_id;

END;
$$;


ALTER FUNCTION "public"."full_stats"("group_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_incomplete_contribs"("group_id" bigint) RETURNS TABLE("contrib" bigint, "thread" bigint, "is_mine" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
 return query select
  "StoryContrib".id as contrib,
  "StoryThread".id as thread,
  (
    (
      select
        auth.uid()
    ) = "StoryContrib".author
  ) as is_mine
from
  "StoryThread"
  join "StoryContrib" on "StoryContrib".thread = "StoryThread".id
where
  "StoryThread".complete = false
  AND "StoryThread"."group" = group_id
  AND exists (select 1 from "StoryMemberRaw" where "user" = (select auth.uid()) AND "group" = "group_id")
order by
  "StoryContrib".id;
end;
$$;


ALTER FUNCTION "public"."get_incomplete_contribs"("group_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_last_contrib"("thread_id" bigint) RETURNS TABLE("content" "text", "id" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin return query
select
  "StoryContrib".content,
  "StoryContrib".id
from
  "StoryThread"
  join "StoryContrib" on "StoryContrib".thread = "StoryThread".id
where
  "StoryThread".complete = false
  AND "StoryThread".id = thread_id
  AND exists (
    select
      1
    from
      "StoryMemberRaw"
    where
      "user" = (
        select
          auth.uid ()
      )
      AND "group" = "StoryThread".group
  )
order by
  "StoryContrib".id desc
limit
  1;
end;
$$;


ALTER FUNCTION "public"."get_last_contrib"("thread_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$begin
  insert into public."User" (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_story_member_delete_fn"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  delete from public."StoryMemberRaw" where id = old.id;
  return old;
end;
$$;


ALTER FUNCTION "public"."on_story_member_delete_fn"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_story_member_insert_fn"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public."StoryMemberRaw" (id, "user", "group")
  values (new.id, new."user", new."group");
  return new;
end;
$$;


ALTER FUNCTION "public"."on_story_member_insert_fn"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."push_contrib"("last_contrib" bigint, "my_content" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  thread_id bigint;
  group_id bigint;
  actual_last_contrib bigint;
  uniq_thread_inc integer;
BEGIN

if length(my_content) < 40 then
  raise exception 'Contributions must be at least 40 characters long.';
end if;

thread_id := (
  select
    thread
  from
    "StoryContrib"
  where
    id = last_contrib
);

group_id := (
  select
    "group"
  from
    "StoryThread"
  where
    id = thread_id
);

if not exists (
  select
    1
  from
    "StoryMemberRaw"
  where
    "group" = group_id
    AND "user" = (
      select
        auth.uid ()
    )
) then
  raise exception 'You''re not a member of this story.';
end if;

if (
  select
    complete
  from
    "StoryThread"
  where
    id = thread_id
) then
  raise exception 'This story is complete and cannot be added to.';
end if;

actual_last_contrib := (
  select
    id
  from
    "StoryContrib"
  where
    "StoryContrib".thread = thread_id
  order by
    id desc
  limit
    1
);

if not (last_contrib = actual_last_contrib) then
  raise exception 'Somebody posted a contribution ahead of yours on the same story, so yours has been rejected. This can happen if you take too long or if lots of people are posting contributions simultaneously.';
end if;

if exists (
  select
    1
  from
    "StoryContrib"
  where
    thread = thread_id
    AND author = (
      select
        auth.uid ()
    )
) then
  uniq_thread_inc := 0;
else
  uniq_thread_inc := 1;
end if;

insert into
  "StoryContrib" (
    author,
    content,
    thread
  )
VALUES
  (
    (
      select
        auth.uid ()
    ),
    my_content,
    thread_id
  );

update "StoryMemberStats"
set
  gems = gems + 1,
  stat_contribs = stat_contribs + 1,
  stat_last_contrib = now(),
  stat_unique_thread_contribs = stat_unique_thread_contribs + uniq_thread_inc
where
  "group" = group_id
  AND "user" = (
    select
      auth.uid ()
  );

END;
$$;


ALTER FUNCTION "public"."push_contrib"("last_contrib" bigint, "my_content" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."push_final_contrib"("last_contrib" bigint, "my_content" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  thread_id bigint;
  group_id bigint;
  actual_last_contrib bigint;
  uniq_thread_inc integer;
BEGIN

if length(my_content) < 40 then
  raise exception 'Contributions must be at least 40 characters long.';
end if;

thread_id := (
  select
    thread
  from
    "StoryContrib"
  where
    id = last_contrib
);

group_id := (
  select
    "group"
  from
    "StoryThread"
  where
    id = thread_id
);

if not exists (
  select
    1
  from
    "StoryMemberRaw"
  where
    "group" = group_id
    AND "user" = (
      select
        auth.uid ()
    )
) then
  raise exception 'You''re not a member of this story.';
end if;

IF NOT EXISTS (
  SELECT
    gems
  FROM
    "public"."StoryMemberStats"
  WHERE
    "group" = "group_id"
    AND "user" = auth.uid ()
    AND gems >= 10
) THEN
  RAISE EXCEPTION 'User does not have enough gems';
END IF;

if (
  select
    complete
  from
    "StoryThread"
  where
    id = thread_id
) then
  raise exception 'This story is complete and cannot be added to.';
end if;

if (
  (
    select
      count(id)
    from
      "StoryContrib"
    where
      "StoryContrib".thread = thread_id
  ) < 20
) then
  raise exception 'This story does not have 20 contributions and cannot be completed.';
end if;

actual_last_contrib := (
  select
    id
  from
    "StoryContrib"
  where
    "StoryContrib".thread = thread_id
  order by
    id desc
  limit
    1
);

if not (last_contrib = actual_last_contrib) then
  raise exception 'Somebody posted a contribution ahead of yours on the same story, so yours has been rejected. This can happen if you take too long or if lots of people are posting contributions simultaneously.';
end if;

if exists (
  select
    1
  from
    "StoryContrib"
  where
    thread = thread_id
    AND author = (
      select
        auth.uid ()
    )
) then
  uniq_thread_inc := 0;
else
  uniq_thread_inc := 1;
end if;

insert into
  "StoryContrib" (
    author,
    content,
    thread
  )
VALUES
  (
    (
      select
        auth.uid ()
    ),
    my_content,
    thread_id
  );

update "StoryThread"
set
  complete = true
where
  id = thread_id;

update "StoryMemberStats"
set
  gems = gems - 10,
  stat_contribs = stat_contribs + 1,
  stat_last_contrib = now(),
  stat_unique_thread_contribs = stat_unique_thread_contribs + uniq_thread_inc,
  stat_threads_completed = stat_threads_completed + 1
where
  "group" = group_id
  AND "user" = (
    select
      auth.uid ()
  );

END;
$$;


ALTER FUNCTION "public"."push_final_contrib"("last_contrib" bigint, "my_content" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."StoryContrib" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "thread" bigint NOT NULL,
    "author" "uuid" NOT NULL,
    "content" "text" NOT NULL
);


ALTER TABLE "public"."StoryContrib" OWNER TO "postgres";


ALTER TABLE "public"."StoryContrib" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."StoryContrib_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."StoryGroup" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "manager" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" "text" NOT NULL,
    CONSTRAINT "StoryGroup_name_check" CHECK (("length"("name") >= 4))
);


ALTER TABLE "public"."StoryGroup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."StoryMemberRaw" (
    "id" bigint NOT NULL,
    "group" bigint NOT NULL,
    "user" "uuid" NOT NULL
);


ALTER TABLE "public"."StoryMemberRaw" OWNER TO "postgres";


ALTER TABLE "public"."StoryMemberRaw" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."StoryMemberRaw_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."StoryMemberStats" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "group" bigint NOT NULL,
    "user" "uuid" NOT NULL,
    "gems" integer DEFAULT 15 NOT NULL,
    "stat_contribs" integer DEFAULT 0 NOT NULL,
    "stat_unique_thread_contribs" integer DEFAULT 0 NOT NULL,
    "stat_threads_created" integer DEFAULT 0 NOT NULL,
    "stat_last_contrib" timestamp without time zone,
    "stat_threads_completed" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."StoryMemberStats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "username" "text" NOT NULL,
    CONSTRAINT "User_username_check" CHECK ((("length"("username") >= 4) AND ("length"("username") <= 32)))
);


ALTER TABLE "public"."User" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."StoryMemberStatsUI" WITH ("security_invoker"='true') AS
 SELECT "StoryMemberStats"."id",
    "StoryMemberStats"."created_at",
    "StoryMemberStats"."group",
    "StoryMemberStats"."user",
    "StoryMemberStats"."gems",
    "StoryMemberStats"."stat_contribs",
    "StoryMemberStats"."stat_unique_thread_contribs",
    "StoryMemberStats"."stat_threads_created",
    "StoryMemberStats"."stat_last_contrib",
    "User"."username"
   FROM ("public"."StoryMemberStats"
     JOIN "public"."User" ON (("User"."id" = "StoryMemberStats"."user")));


ALTER TABLE "public"."StoryMemberStatsUI" OWNER TO "postgres";


ALTER TABLE "public"."StoryMemberStats" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."StoryMember_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."StoryThread" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "group" bigint NOT NULL,
    "complete" boolean DEFAULT false NOT NULL,
    "author" "uuid" NOT NULL
);


ALTER TABLE "public"."StoryThread" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."StoryThreadCompleteWithContent" WITH ("security_invoker"='true') AS
 SELECT "StoryContrib"."content",
    "StoryContrib"."thread",
    "StoryThread"."group"
   FROM ("public"."StoryThread"
     JOIN "public"."StoryContrib" ON (("StoryContrib"."thread" = "StoryThread"."id")))
  WHERE ("StoryThread"."complete" = true);


ALTER TABLE "public"."StoryThreadCompleteWithContent" OWNER TO "postgres";


ALTER TABLE ONLY "public"."StoryContrib"
    ADD CONSTRAINT "StoryContrib_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StoryGroup"
    ADD CONSTRAINT "StoryGroup_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StoryMemberRaw"
    ADD CONSTRAINT "StoryMemberRaw_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StoryMemberStats"
    ADD CONSTRAINT "StoryMember_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StoryThread"
    ADD CONSTRAINT "StoryThread_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."StoryMemberRaw"
    ADD CONSTRAINT "story_member_raw_unique_group_user" UNIQUE ("group", "user");



ALTER TABLE ONLY "public"."StoryMemberStats"
    ADD CONSTRAINT "story_member_stats_unique_group_user" UNIQUE ("group", "user");



CREATE INDEX "StoryContrib_author_idx" ON "public"."StoryContrib" USING "btree" ("author");



CREATE INDEX "StoryContrib_thread_idx" ON "public"."StoryContrib" USING "btree" ("thread");



CREATE INDEX "StoryGroup_manager_idx" ON "public"."StoryGroup" USING "btree" ("manager");



CREATE INDEX "StoryMemberRaw_user_idx" ON "public"."StoryMemberRaw" USING "btree" ("user");



CREATE INDEX "StoryMember_group_idx" ON "public"."StoryMemberStats" USING "btree" ("group");



CREATE INDEX "StoryMember_user_idx" ON "public"."StoryMemberStats" USING "btree" ("user");



CREATE INDEX "StoryThread_author_idx" ON "public"."StoryThread" USING "btree" ("author");



CREATE INDEX "StoryThread_group_idx" ON "public"."StoryThread" USING "btree" ("group");



CREATE OR REPLACE TRIGGER "on_story_member_delete" AFTER DELETE ON "public"."StoryMemberStats" FOR EACH ROW EXECUTE FUNCTION "public"."on_story_member_delete_fn"();



CREATE OR REPLACE TRIGGER "on_story_member_insert" AFTER INSERT ON "public"."StoryMemberStats" FOR EACH ROW EXECUTE FUNCTION "public"."on_story_member_insert_fn"();



ALTER TABLE ONLY "public"."StoryContrib"
    ADD CONSTRAINT "StoryContrib_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StoryContrib"
    ADD CONSTRAINT "StoryContrib_thread_fkey" FOREIGN KEY ("thread") REFERENCES "public"."StoryThread"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StoryGroup"
    ADD CONSTRAINT "StoryGroup_manager_fkey" FOREIGN KEY ("manager") REFERENCES "public"."User"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."StoryMemberRaw"
    ADD CONSTRAINT "StoryMemberRaw_group_fkey" FOREIGN KEY ("group") REFERENCES "public"."StoryGroup"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StoryMemberRaw"
    ADD CONSTRAINT "StoryMemberRaw_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StoryMemberStats"
    ADD CONSTRAINT "StoryMember_group_fkey" FOREIGN KEY ("group") REFERENCES "public"."StoryGroup"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StoryMemberStats"
    ADD CONSTRAINT "StoryMember_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StoryThread"
    ADD CONSTRAINT "StoryThread_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."StoryThread"
    ADD CONSTRAINT "StoryThread_group_fkey" FOREIGN KEY ("group") REFERENCES "public"."StoryGroup"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can fetch all IDs and usernames" ON "public"."User" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."StoryMemberStats" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT "StoryGroup"."id",
    "StoryGroup"."manager"
   FROM "public"."StoryGroup"
  WHERE (("StoryGroup"."id" = "StoryMemberStats"."group") AND ("StoryGroup"."manager" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."StoryContrib" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."StoryGroup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."StoryMemberRaw" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."StoryMemberStats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."StoryThread" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can create StoryGroups they manage" ON "public"."StoryGroup" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "manager"));



CREATE POLICY "Users can select StoryGroups they belong to" ON "public"."StoryGroup" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."StoryMemberRaw"
  WHERE (("StoryMemberRaw"."group" = "StoryGroup"."id") AND ("StoryMemberRaw"."user" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can select StoryThreads in groups they're a member of" ON "public"."StoryThread" FOR SELECT USING (("group" IN ( SELECT "StoryMemberRaw"."group"
   FROM "public"."StoryMemberRaw"
  WHERE ("StoryMemberRaw"."user" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can select contributions in groups they belong to" ON "public"."StoryContrib" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "StoryMemberRaw"."user"
   FROM ("public"."StoryMemberRaw"
     JOIN "public"."StoryThread" ON (("StoryThread"."id" = "StoryContrib"."thread")))
  WHERE (("StoryMemberRaw"."user" = ( SELECT "auth"."uid"() AS "uid")) AND ("StoryMemberRaw"."group" = "StoryThread"."group")))));



CREATE POLICY "Users can select others in the same groups" ON "public"."StoryMemberStats" FOR SELECT TO "authenticated" USING ((("group" IN ( SELECT "StoryMemberRaw"."group"
   FROM "public"."StoryMemberRaw")) OR (( SELECT "auth"."uid"() AS "uid") = "user")));



CREATE POLICY "Users can select themselves in StoryMemberRaw" ON "public"."StoryMemberRaw" FOR SELECT TO "authenticated" USING (("user" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update StoryGroups they manage" ON "public"."StoryGroup" FOR UPDATE USING (("manager" = ( SELECT "auth"."uid"() AS "uid")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
































































































































































































GRANT ALL ON FUNCTION "public"."create_story"("name" "text", "group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_story"("name" "text", "group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_story"("name" "text", "group_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_thread"("group_id" bigint, "content_new" "text", "thread_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_thread"("group_id" bigint, "content_new" "text", "thread_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_thread"("group_id" bigint, "content_new" "text", "thread_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."full_stats"("group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."full_stats"("group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."full_stats"("group_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_incomplete_contribs"("group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_incomplete_contribs"("group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_incomplete_contribs"("group_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_last_contrib"("thread_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_last_contrib"("thread_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_last_contrib"("thread_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."on_story_member_delete_fn"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_story_member_delete_fn"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_story_member_delete_fn"() TO "service_role";



GRANT ALL ON FUNCTION "public"."on_story_member_insert_fn"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_story_member_insert_fn"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_story_member_insert_fn"() TO "service_role";



GRANT ALL ON FUNCTION "public"."push_contrib"("last_contrib" bigint, "my_content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."push_contrib"("last_contrib" bigint, "my_content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."push_contrib"("last_contrib" bigint, "my_content" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."push_final_contrib"("last_contrib" bigint, "my_content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."push_final_contrib"("last_contrib" bigint, "my_content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."push_final_contrib"("last_contrib" bigint, "my_content" "text") TO "service_role";





















GRANT ALL ON TABLE "public"."StoryContrib" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE ON TABLE "public"."StoryContrib" TO "authenticated";
GRANT ALL ON TABLE "public"."StoryContrib" TO "service_role";



GRANT SELECT("id") ON TABLE "public"."StoryContrib" TO "authenticated";



GRANT SELECT("thread") ON TABLE "public"."StoryContrib" TO "authenticated";



GRANT SELECT("content") ON TABLE "public"."StoryContrib" TO "authenticated";



GRANT ALL ON SEQUENCE "public"."StoryContrib_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."StoryContrib_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."StoryContrib_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."StoryGroup" TO "anon";
GRANT ALL ON TABLE "public"."StoryGroup" TO "authenticated";
GRANT ALL ON TABLE "public"."StoryGroup" TO "service_role";



GRANT ALL ON TABLE "public"."StoryMemberRaw" TO "anon";
GRANT ALL ON TABLE "public"."StoryMemberRaw" TO "authenticated";
GRANT ALL ON TABLE "public"."StoryMemberRaw" TO "service_role";



GRANT ALL ON SEQUENCE "public"."StoryMemberRaw_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."StoryMemberRaw_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."StoryMemberRaw_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."StoryMemberStats" TO "anon";
GRANT ALL ON TABLE "public"."StoryMemberStats" TO "authenticated";
GRANT ALL ON TABLE "public"."StoryMemberStats" TO "service_role";



GRANT ALL ON TABLE "public"."User" TO "anon";
GRANT ALL ON TABLE "public"."User" TO "authenticated";
GRANT ALL ON TABLE "public"."User" TO "service_role";



GRANT ALL ON TABLE "public"."StoryMemberStatsUI" TO "anon";
GRANT ALL ON TABLE "public"."StoryMemberStatsUI" TO "authenticated";
GRANT ALL ON TABLE "public"."StoryMemberStatsUI" TO "service_role";



GRANT ALL ON SEQUENCE "public"."StoryMember_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."StoryMember_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."StoryMember_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."StoryThread" TO "anon";
GRANT ALL ON TABLE "public"."StoryThread" TO "authenticated";
GRANT ALL ON TABLE "public"."StoryThread" TO "service_role";



GRANT ALL ON TABLE "public"."StoryThreadCompleteWithContent" TO "anon";
GRANT ALL ON TABLE "public"."StoryThreadCompleteWithContent" TO "authenticated";
GRANT ALL ON TABLE "public"."StoryThreadCompleteWithContent" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
