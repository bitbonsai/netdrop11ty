---
title: netdrop11ty = Netlify + Dropbox + 11ty
layout: base.njk
---

![{{ meta.title }}](/img/logos.svg)

The content below is being fetched from Dropbox:

<div class="dbx-contents">
<ul>
{% for d in collections.dbx %}
<li><a href="{{d.url}}">{{ d.data.name }}</a></li>
{% endfor %}
</ul>
</div>

# TL;DR

1. Place content (`.md` files, images) on a Dropbox folder
2. This triggers a Netlify build for a 11ty SSG site
3. Go to your site and enjoy!
