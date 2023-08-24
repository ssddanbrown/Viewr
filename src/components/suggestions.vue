<template>
    <div>
        <div v-if="history.size > 0">
            <h2>History</h2>
            <div class="suggestions">
                <p v-for="sub in history" :key="sub" @click="select(sub)">{{ sub }}</p>
            </div>
        </div>

        <h2>Suggestions</h2>
        <div class="suggestions">
            <p v-for="(label, sub) in suggestions" :key="sub" @click="select(sub)">{{ label }}</p>
        </div>
    </div>
</template>
<script>

import * as History from "../history";

const labelBySubreddit = {
    aww: "Aww",
    cats: "Cats",
    puppies: "Puppies",
    cute: "Cute",
    redpandas: "RedPandas",
    aww_gifs: "AwwGifs",
    foxes: "Foxes",
    hardcoreaww: "HardcoreAww",
    rabbits: "Rabbits",
    CatGifs: "CatGifs",
    CatsStandingUp: "CatsStandingUp",
    dogpictures: "DogPictures",
    pics: "Pics",
    photography: "Photography",
    gifs: "GIFs",
    hdr: "HDR",
};

export default {
    data() {
        return {
            suggestions: labelBySubreddit,
            history: new Set(),
        };
    },
    mounted() {
        this.history = History.load();
    },
    methods: {
        select(subreddit) {
            this.$emit('select', subreddit);
        }
    }
}
</script>

