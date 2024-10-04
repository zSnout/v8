---
category: meta
description: An updated privacy policy for zSnout 8
excerpt: <excerpt does not exist yet>
imageAlt: Is 2051 divisible by 7? 2051 - 21 = 2030; 203 - 63 = 140; 14 - 14 = 0.
published: 2021-12-07
title: Privacy Policy
draft: true
---

Last updated October 3, 2023.

As an open source project, you can see every way zSnout collects data on you by
perusing our [source code](https://github.com/zSnout/v8). However, we're also
obligated to have a normal privacy policy, and will explicitly declare all
information collected on you here.

This is not intended to be a formal document, as zSnout is first and foremost a
personal project. <u>**If you are concerned about your rights and do not wish to
have any data collected, simply do not use the account-based services.**</u>

## If you don't have an account

If you don't have an account, zSnout collects almost zero information about you.
Some data is saved to **YOUR** computer, such as your theme preferences Ithkuil
and Utility Kit words, but that information is **not shared with us**.

## Aside: some terminology

"zSnout" is a group which manages many projects, including this website. This
website is also typically referred to as "zSnout". It is also referred to as
"zSnout 8" or "zSnout v8" or simply "v8", as it is the eighth version of the
website.

The previous version of zSnout to be hosted at zsnout.com, henceforth called
"zSnout v7" or "v7" for short, has a privacy policy accessible at
[v7.zsnout.com/privacy-policy](https://v7.zsnout.com/privacy-policy). zSnout v1,
v2, v3, v4, and v5 also had privacy policies, but their sites no longer exist
and their policies are inaccessible.

## If you have an account

If you have an account, we collect only information that is strictly necessary
to keeping your account operational.

### Account creation

When you create an account, the following information is stored:

- your username
- your email address
- your password, [properly hashed using bcrypt](#password-hashing)

We also record the time of the following events (and no others):

- when you signed up
- when we sent the email verification link
- when you clicked that link
- the last time you signed in
- the last time you changed your account info

If you are an experienced programmer and try to send us additional information,
it will likely be logged somewhere. Please don't do that.

### Story groups

Story groups are a fun way to create long pieces of writing with friends, but
with a twist: on any given story, you can only see the last contribution that
was written when you write your own next contribution.

Story groups store additional data in order to function properly. A story group
itself stores:

- when it was created
- who manages the group
- the group's name
- for each member,
  - when they were added to the group
  - how many gems they have
- for each story,
  - its creation date
  - whether it has been completed
- for each contribution to a story,
  - its author
  - its content

Some precomputed statistics are also saved (contribution count per member,
thread creation count per member, etc.), but these can all be computed from the
information listed above.

Note that while contributions are anonymous to any viewer of the story, their
authors are still saved in the database. This ensures we can take decisive
action against anybody should they upload illegal content as part of a story.

### Password hashing

zSnout hashes your account password so that attackers cannot read it. This means
we convert your password into an unrecognizable sequence of binary that is
derived from your initial password through a process which cannot easily[^1] be
reversed. We are still of course able to verify when you enter the correct
password by comparing the hashes and checking if they match, but what you type
in is never visible to anybody, not even our site's owners.

## Closing notes

zSnout promises never to share your information with third-parties. If you have
concerns about anything relating to your data or privacy policy,
[create a publicly viewable issue in our GitHub repository](https://github.com/zSnout/v8/issues)
or email us privately at `sakawi [at] zsnout [dot] com`.

## Footnotes

[^1]:
    The hashing algorithm we use at the time of writing is bcrypt. For
    moderately strong passwords, reversing bcrypt takes approximately 22 years,
    and will likely only happen if you are the direct target of a cyberattack.
    Your password is safe.
