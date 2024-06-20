---
description: An overview of all posts.
---

<script setup>import {data} from './overview.data.ts';
import {useUrlSearchParams} from "@vueuse/core";
import {cleanTag} from '../src';

const params = useUrlSearchParams('history');
const cleanedTag = cleanTag(params.tag)

[data]
</script>

# Overview <span v-if="params.tag">for #{{params.tag}}</span>

<ul>
<template v-for="post in data">
    <li v-if="!params.tag || post.tags?.map(cleanTag).includes(cleanedTag)"><a :href="post.link">{{ post.title }}</a></li>
</template>
</ul>
