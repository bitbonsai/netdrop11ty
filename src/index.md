---
title: netdrop11ty = Netlify + Dropbox + 11ty
layout: base.njk
---

<img class="biglogo" src="/img/favicon.svg" alt="{{ meta.siteName }}" width="240" height="289" />

![{{ meta.siteName }}](/img/logos.svg)

↓ This content is being fetched from a [Dropbox](https://dropbox.com) folder and published to a [Netlify](https://netlify.com) site with [11ty](https://11ty.dev)

<div class="dbx-contents">
<ul>
{% for d in collections.dbx %}
<li><a href="{{d.url}}">{{ d.data.name }}</a></li>
{% endfor %}
</ul>
</div>

# TL;DR

1. Place content (`.md`, `.jpg` files, whatever) on a Dropbox folder
2. This will trigger a `Netlify build`
3. Your 11ty site will be updated!

# Background

This is an experiment on building the **simplest possible CMS** (content management system).

The main idea is to drop a few `.md` files in a Dropbox folder, together with some images, and boom! Site updated.

**Disclaimer**: this started as a fork of [netlibox](https://github.com/jimniels/netlibox) from [Jim Niels](https://github.com/jimniels), but I wrote it from scratch to learn what I was doing and to add 2 features:

1. The ability to use images as well (netlibox is meant for Markdown only)
2. To use [11ty](https://11ty.dev) instead of Jekyll. I found netlibox and handy tips on [Netlify's blog](https://www.netlify.com/blog/2018/10/15/combining-netlify-with-dropbox-for-a-one-click-publishing-process/). Without it, this wouldn't be possible. Thanks a lot, mate!

My first idea was to build a Notion backed CMS, but at this point, there's no support for images. Any alternative I could think of to store pictures would require at least 2 services, one for content, another for pictures or binary content.

I'm perfectly fine with git. But what about people who are not and would like an easy way to update website content?

Writing Markdown might not be super easy for some, but there are tools to help, like [Typora](https://typora.io/).

This project is part of [freecommerce.com.au](https://freecommerce.com.au), an initiative to help Australian small businesses to have an online e-commerce presence for free.

And it can be checked/cloned on Github, at https://github.com/bitbonsai/netdrop11ty

---

# 5 steps to success

## Requirements

You'll need to have 3 free accounts on:

- Dropbox
- Netlify
- Github (or Gitlab, Bitbucket)

### 1. Clone this repo to your account on GitHub (or another provider)

You don't need to be a git expert to do this. You can use the `fork` button on Github's UI, or use a free visual tool like [Github Desktop](https://desktop.github.com/) or [Atlassian Source Tree](https://www.sourcetreeapp.com/).

Cloning is just copying these source files to a place where you can edit them. Using those desktop apps will put them in your computer for local acess, `forking` will create a copy you can edit online on github using the browser.

![Fork button on github](/img/fork.png)

### 2. Create Dropbox App to hold your content

Log into your Dropbox account in the browser, and go to the [My apps page](https://www.dropbox.com/developers/apps). There you can create an App, which is a particular folder that your site will access and get content from.

![Create App at Dropbox](/img/create-app.png)

Make sure to select `Scoped Access` and `App folder`, so your site will only have access to this App's folder, not your entire account. Choose a fancy name and go configure your App!

![Crete app - step 1](/img/create1.png)

Your App will be created. Now check the settings and make sure that `Permission type` is scoped. Check the `App folder name`, and change `Access token expiration` to `No expiration` if you like.

Click on `Generate access token` and copy that value. You'll need it later.

You can see in the screenshot the `Webhook URIs` filled in, but no worries, we'll do it later.

![App Settings tab](/img/settings.png)

#### Important: set the right permissions

This got me a couple times. You'll get `400` errors if you forget this. Go to the permissions tab and check `Files and folders` permissions. You need to make sure `files.metadata.read` and `files.content.read` are checked. Save, and for now, we're done in Dropbox.

![App Permissions tab](/img/permissions.png)

### 3. Create a new Netlify site from your GitHub repo

On Netlify, create a new site from git. Follow the authorization prompts, find your repo, connect it to Netlify.

![Connect to a git provider](/img/netlify1.png)

![Pick a repo](/img/netlify2.png)

![Site settings and deploy](/img/netlify3.png)

#### 3.1 Netlify site settings

There are a couple steps to do here.

Go to the `Site Settings` option (top right), and let's start.

![Site settings](/img/netlify4.png)

The first one is to customize the `Site name` to something that makes more sense to you. This will be used in the URL and is unique to the whole Netlify. In the example here, I chose `netdrop11ty.netlify.app`

Next, create a `Build hook`. Just click the button `Add` and accept defaults. Give it the following name: `NETLIFY_BUILD_HOOK_URL`

Then, go to `Build & Deploy` → `Environment variables`. You'll create 3 `ENV` variables:

<div class="dbx-contents pre">CONTENT_DIR: ./src/dbx
DBX_ACCESS_TOKEN: [YOUR DROPBOX TOKEN]
NETLIFY_BUILD_HOOK_URL: [THE GENERATED BUILD HOOK IN THE STEP ABOVE]
</div>

#### 3.2 Netlify functions

Dropbox has a particularity that we need to deal with through Netlify's functions. The first request you do to dbx API will give you a _challenge_ query string parameter and requires another request with the same parameter back. After that, you can actually request the files.

Therefore we need a [Netlify function](https://docs.netlify.com/functions/overview/?_ga=2.144098101.108854660.1628386823-1325281063.1626650890), which is going to be executed on every build before we request the actual folder contents to dropbox. So here's what happens when you `build`:

1. Netlify function sends an API request to Dropbox → `dbx-webhook.js`
2. Dropbox answers with a challenge param
3. Netlify function responds back with challenge parameter. We're clear with DBX
4. Netlify runs `npm run build` from our `package.json`, which triggers `get-content-from-dbx.js` first
5. With the DBX content, 11ty builds the site with updated content and puts in `_site`. Netlify deployment is **done**

I got the [function](https://github.com/jimniels/netlibox/blob/master/src/_netlify-functions/dropbox-webhook.js) from netlibox repo, thanks once more, [Jim](https://github.com/jimniels)!

It's possible to test this function locally if you install `netlify-lambda`. I haven't because it has some security issues and installs webpack; I preferred not to. If you do, please check [netlibox](https://github.com/jimniels/netlibox/), which does.

![Functions menu](/img/netlify5.png)

Go to the functions menu, and change its `Function Directory` settings to `src/_netlify-function`.

In the next deployment, this will create a function that you'll need next. Load the [functions](https://app.netlify.com/sites/netdrop11ty/functions) page, and you should now see:

![dbx-webhook function](/img/netlify7.png)

Clicking on it will give you access to the function URL that we need. It's easy to infer as well. In my case is `https://netdrop11ty.netlify.app/.netlify/functions/dbx-webhook`

### 4. Netlify functions into Dropbox

Remember the [Dropbox App console](https://www.dropbox.com/developers/apps)? Let's go back there and finish the configuration.

Scroll the page until you find `Webhooks URI`, and add the one you just copied above.

![Webhooks at Dropbox App console](/img/webhooks-dbx.png).

If all goes well, you should see an `Enabled` status. If not, delete it, go back to Netlify to get the correct URL and add it.

If you forgot to add the proper permissions in Dropbox and start to get a 400, add the permission, generate a new access token and put it into Netlify UI.

### 5. Last step: `.env` file

Now you already have all the elements. Just rename the local `.env.example` file to `.env` (it's inside .gitignore, so your tokens are not shared) and fill `DBX_ACCESS_TOKEN` and `NETLIFY_BUILD_HOOK_URL` as you've done in Netlify's UI.

And from here? `Deploy`!
