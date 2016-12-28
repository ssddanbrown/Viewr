<template>
    <div class="fancy-radio">
        <input :id="id" :checked="value === newValue" type="radio" :value="newValue" v-on:change="updateValue">
        <label :for="id"><slot></slot></label>
    </div>
</template>

<script>
    export default {
        props: ['value', 'newValue'],
        data: function() {
            return {
                id: 'fancy-radio-' + Math.random().toString(36).substr(2, 10)
            }
        },
        methods: {
            updateValue() {
                let formattedValue = this.newValue.trim();
                this.$emit('input', formattedValue)
            }
        }
    }
</script>
