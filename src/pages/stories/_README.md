# Database

```ts
export interface Row {
  manager: Username
  members: Record<Username, UserInfo>
  invited: Record<Username, InviteCode>

  manager: UserId
  members: UserId[]
  stories_in_progress: Contrib[][]
  stories_completed: Contrib[][]

  gems: Record<UserId, number>
  stats_contribs: Record<UserId, number>
  stats_stories: Record<UserId, number>
  stats_last_active: Record<UserId, number>
}

export type UserInfo = readonly [
  removed: boolean,
  password: HashedByUsername,
  email: HashedByUsername,
]

export type InviteCode = string

export type Contrib = readonly [content: string, author: Username]

export type Username = string

export type HashedByUsername = string
```

## Actions

**Create a group**

**Rename a group**

**Invite someone to a group**

**Accept an invite to a group**

**Reset password**

**Add to a story**

**Create a story**

**Finish a story**

**Load statistics**

**Load completed stories**

**View a completed story**
