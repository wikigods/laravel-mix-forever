<template>
    <div>{{ message }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

type Greeting = string;

export default defineComponent({
    setup() {
        const message: Greeting = 'Vue 3 with TypeScript';

        return { message };
    }
});
</script>
