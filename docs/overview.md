---
title: Overview
description: An overview of all posts.
---

<script setup>
import {data} from './overview.data.ts';
import {useUrlSearchParams} from "@vueuse/core";
import {normalizeTag} from '../src';

const params = useUrlSearchParams('history');
const nomalizedTag = normalizeTag(params.tag);

[data];
</script>

# <span v-if="params.tag">Articles about "{{params.tag}}"</span><span v-else>Overview</span>

<ul>
<template v-for="post in data">
    <li v-if="!params.tag || post.tags?.map(normalizeTag).includes(nomalizedTag)"><a :href="post.link">{{ post.title }}</a></li>
</template>
</ul>
