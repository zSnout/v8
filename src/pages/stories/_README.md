# Database

```ts
/** @table */
export interface PendingUser {
  id: UserId
  code: InviteCode
  username: Username
  email: HashedEmail
  creation: DateTime
  verification: DateTime
}

/** @table */
export interface User {
  id: UserId
  code: InviteCode | undefined
  username: Username
  email: HashedEmail
  creation: DateTime
  verification: DateTime

  // Relations
  groups: GroupId[]
}

/** @table */
export interface Group {
  // Metadata
  id: GroupId
  title: string
  creation: DateTime
  verification: DateTime

  // User data
  manager: UserId
  members: Record<UserId, true>

  // Stories
  stories_in_progress: Record<StoryId, Story>
  stories_completed: Record<StoryId, Story>

  // Statistics
  gems: Record<UserId, number>
  stats_contribs: Record<UserId, number>
  stats_participated_in: Record<UserId, number>
  stats_stories_created: Record<UserId, number>
  stats_last_active: Record<UserId, number>
  stats_in_complete_contribs: Record<UserId, number>
  stats_in_complete_participated_in: Record<UserId, number>
}

type Story = Contrib[]

type StoryId = number

type GroupId = number

type InviteCode = string

type HashedEmail = string

type Contrib = readonly [content: string, author: UserId]

type Username = string
```

# Authentication

Authentication uses JSON Web Tokens. The tokens contain the user's id.

# Actions

An action describes a sequence of steps carried out by a client and a server.
Steps executed on the client are labeled `(C)`, and those executed on the server
are labeled `(S)`.

An action may have at most one transition from client code to server code. If
multiple client-to-server transitions are required, split the action into
multiple sub-actions. This mimics how HTTP requests work in reality, which
simplifies transferring these outlines into actual code.

The code is written assuming no errors happen. If an error happens, the client
should be notified appropriately.

## Authentication

**Create an account (1/2: basic information)**

1. (C) Pick a username and email address
2. (S) Insert an appropriate entry into `PendingUser`
3. (S) Send an email to that address with `/account/confirm/<id>`
4. (C) Client is expected to click the link

**Create an account (2/2: verify email address)**

1. (C) GET `/account/confirm/<id>`
2. (S) If the id does not exist, return an error
3. (S) Move the user from `PendingUser` to `User`
4. (S) Add the proper JWT
5. (C) Redirect to `/account`

**Log in (1/2: enter email)**

1. (C) Enter the email address
2. (S) If the user does not exist, return an error
3. (S) Send an email to that address with `/account/log-in/<code>`
4. (C) Client is expected to click the link

**Log in (2/2: confirm email)**

1. (C) GET `/account/log-in/<code>`
2. (S) If the user does not exist, return an error
3. (S) Remove the invite code from the database
4. (S) Add the proper JWT
5. (S) Redirect to `/account`

**Create a group** (requires authentication)

1. (C) Pick a title for the group
2. (S) Insert an appropriate entry into `Group`
3. (S) Redirect to `/story/<id>`

**Invite someone to a group** (manager only)

1. (C) Write the username of the user to be invited
2. (S) Verify the username exists
3. (S) Add the user to the group

**Transfer manager permissions** (manager only)

1. (C) Select the member to transfer manager permissions to
2. (S) Verify the member exists
3. (S) Mark them as the manager

**Remove someone from a group** (manager only)

1. (C) Select the member to remove
2. (S) Remove the selected member

**Rename a group** (manager only)

1. (C) Choose the new name of the group
2. (S) Update the group to reflect the new name

**View a completed story** (member only)

1. (C) GET `/story/<group_id>/<story_id>`
2. (S) Validate the story

**Load statistics** (member only)

1. (S) Send all `stats_` statistics
2. (S) Send usernames of all users in `stats_` dataset

**Load completed stories** (member only)

1. (S) Send `stories_completed`, but remove author information

**Create a story** (requires 10+ gems)

1. (C) Type the first sentence of the new story
2. (S) Verify the member has at least 10 gems
3. (S) Remove 10 gems from the member
4. (S) Create the new story
5. (S) Send an updated home view
6. (S) Update statistics

**Add to a story (1/2: choose story)** (member only)

1. (S) Pick an appropriate story for the given user
2. (S) Send the last contribution to that story
3. (S) Send the id of that story

**Add to a story (2/2: send contribution)** (member only)

1. (C) Write next contribution
2. (S) Verify `contribution.length > 40`
3. (S) Add the contribution to the appropriate story
4. (S) Update statistics

**Finish a story (/2)** (member only)

Same steps as "Add to a story", except with different selection criteria, and
the story is moved to `stories_completed`.
