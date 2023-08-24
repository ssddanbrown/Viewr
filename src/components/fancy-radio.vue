<template>
    <div class="fancy-radio">
        <input :id="id" :checked="modelValue === newValue" type="radio" :value="newValue" v-on:change="updateValue">
        <label :for="id"><slot></slot></label>
    </div>
</template>

<script>
    export default {
        props: {
            modelValue: String,
            newValue: String,
        },
        data() {
            return {
                id: 'fancy-radio-' + Math.random().toString(36).substr(2, 10)
            }
        },
        methods: {
            updateValue() {
                const formattedValue = this.newValue.trim();
                this.$emit('update:modelValue', formattedValue)
            }
        }
    }
</script>
