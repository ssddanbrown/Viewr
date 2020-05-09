<template>
    <img :src="localSrc" :alt="localAlt"
         @click="onClick"
         @load="$emit('load', $event)"
         @touchstart.prevent.stop="onStart"
         @mousedown.prevent.stop="onStart"
         @touchmove.stop="onMove"
         @mousemove.stop="onMove"
         @touchend.prevent.stop="onEnd"
         @mouseup.prevent.stop="onEnd">
</template>
<script>
    // Much of this is take from Paul Lewis's card swiping demo:
    // https://codepen.io/peterdillon/pen/yJMLoZ
    export default {
        name: 'SwipeImage',
        props: {
            src: {
                type: String,
                required: true,
            },
            alt: {
                type: String,
                required: true,
            }
        },
        data() {
            return {
                localSrc: '',
                localAlt: '',
                startX: 0,
                currentX: 0,
                screenX: 0,
                dragging: false,
                animating: false,
                rect: {},
                targetX: 0,
            }
        },
        watch: {
            src: {
                handler(newVal) {
                    this.localSrc = '';
                    this.localAlt = '';
                    this.reset();
                    window.setTimeout(() => {
                        this.localSrc = this.src;
                        this.localAlt = this.alt;
                    }, 50);
                },
                immediate: true,
            }
        },
        methods: {
            onStart(event) {
                this.rect = this.$el.getBoundingClientRect();
                this.startX = event.pageX || event.touches[0].pageX;
                this.currentX = this.startX;
                this.dragging = true;
                this.animating = true;
                this.$el.style.willChange = 'transform';
                window.requestAnimationFrame(this.update);
            },
            onMove(event) {
                if (!this.animating) return;

                this.currentX = event.pageX || event.touches[0].pageX;
            },
            onEnd(event) {
                if (!this.animating) return;

                this.targetX = 0;

                const screenX = this.currentX - this.startX;
                const threshold = this.rect.width * 0.35;

                if (Math.abs(screenX) > threshold) {
                    this.targetX = (screenX > 0) ? this.rect.width : -this.rect.width;
                }

                this.dragging = false;
            },
            onClick(event) {
                if (Math.abs(this.screenX) > 3) {
                    event.stopPropagation();
                }
            },
            reset() {
                if (!this.animating) return;

                this.animating = false;
                this.$el.style.willChange = 'initial';
                this.$el.style.transform = 'none';
                this.$el.style.opacity = '1';
            },
            update () {
                if (!this.animating) return;

                requestAnimationFrame(this.update);

                if (this.dragging) {
                    this.screenX = this.currentX - this.startX;
                } else {
                    this.screenX += (this.targetX - this.screenX) / 4;
                }

                const normalizedDragDistance = (Math.abs(this.screenX) / this.rect.width);
                const opacity = 1 - Math.pow(normalizedDragDistance, 3);

                this.$el.style.transform = `translateX(${this.screenX}px)`;
                this.$el.style.opacity = opacity;

                // User has finished dragging.
                if (this.dragging) return;

                const isNearlyAtStart = (Math.abs(this.screenX) < 0.1);
                const isNearlyInvisible = (opacity < 0.01);

                // If the card is nearly gone.
                if (isNearlyInvisible) {

                    // Bail if there's no target or it's not attached to a parent anymore.
                    if (!this.animating || !this.$el.parentNode) return;
                    this.reset();
                    this.$emit('next');

                } else if (isNearlyAtStart) {
                    this.reset();
                }
            }
        }
    }
</script>