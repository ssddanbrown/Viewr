<template>
    <div id="suggestions">
        <p @click="select('aww')">Aww</p>
        <p @click="select('cats')">Cats</p>
        <p @click="select('puppies')">Puppies</p>
        <p @click="select('cute')">Cute</p>
        <p @click="select('redpandas')">RedPandas</p>
        <p @click="select('aww_gifs')">AwwGifs</p>
        <p @click="select('foxes')">Foxes</p>
        <p @click="select('hardcoreaww')">HardcoreAww</p>
        <p @click="select('rabbits')">Rabbits</p>
        <p @click="select('CatGifs')">CatGifs</p>
        <p @click="select('CatsStandingUp')">CatsStandingUp</p>
        <p @click="select('dogpictures')">DogPictures</p>
        <p @click="select('pics')">Pics</p>
        <p @click="select('photography')">Photography</p>
        <p @click="select('earthporn')">Earth</p>
        <p @click="select('spaceporn')">Space</p>
        <p @click="select('gifs')">GIFs</p>
        <p @click="select('hdr')">HDR</p>
        <p @click="select('AbandonedPorn')">Abandoned</p>
        <p @click="select('FuturePorn')">Future</p>
        <p @click="select('FoodPorn')">Food</p>
        <p @click="select('AnimalPorn')">Animals</p>
        <p @click="select('MapPorn')">Maps</p>
        <p @click="select('ArtPorn')">Art</p>
    </div>
</template>
<script>
export default {
    methods: {
        select(subreddit) {
            this.$emit('select', subreddit);
        }
    }
}
</script>

