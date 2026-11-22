<script setup>
import { useId } from "vue";

defineProps({
  size: {
    type: Number,
    default: 40,
  },
  spinning: {
    type: Boolean,
    default: false,
  },
  glowing: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: "",
  },
});

const id = `pb-${useId()}`;
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    :width="size"
    :height="size"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    :class="[spinning ? 'animate-spin' : '', className]"
    :style="
      spinning
        ? {
          animationDuration: '3s',
          animationTimingFunction: 'linear',
        }
        : undefined
    "
  >
    <defs>
      <!-- Top-half dark dome -->
      <radialGradient
        :id="`${id}-top`"
        cx="42%"
        cy="35%"
        r="60%"
        gradientUnits="objectBoundingBox"
      >
        <stop
          offset="0%"
          stop-color="#1C2A45"
        />
        <stop
          offset="60%"
          stop-color="#111A2C"
        />
        <stop
          offset="100%"
          stop-color="#080C17"
        />
      </radialGradient>

      <!-- Bottom-half gradient -->
      <radialGradient
        :id="`${id}-bot`"
        cx="58%"
        cy="72%"
        r="55%"
        gradientUnits="objectBoundingBox"
      >
        <stop
          offset="0%"
          stop-color="#172035"
        />
        <stop
          offset="100%"
          stop-color="#080C17"
        />
      </radialGradient>

      <!-- Gold centre strip -->
      <linearGradient
        :id="`${id}-band`"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stop-color="#F6C945"
          stop-opacity="0.9"
        />
        <stop
          offset="40%"
          stop-color="#F6C945"
        />
        <stop
          offset="100%"
          stop-color="#C89A1A"
          stop-opacity="0.85"
        />
      </linearGradient>

      <!-- Centre button gradient -->
      <radialGradient
        :id="`${id}-btn`"
        cx="40%"
        cy="35%"
        r="65%"
        gradientUnits="objectBoundingBox"
      >
        <stop
          offset="0%"
          stop-color="#FFF0A0"
        />
        <stop
          offset="45%"
          stop-color="#F6C945"
        />
        <stop
          offset="100%"
          stop-color="#A07010"
        />
      </radialGradient>

      <!-- Outer glow filter -->
      <filter
        :id="`${id}-glow`"
        x="-30%"
        y="-30%"
        width="160%"
        height="160%"
      >
        <feGaussianBlur
          stdDeviation="3.5"
          result="blur"
        />
        <feComposite
          in="SourceGraphic"
          in2="blur"
          operator="over"
        />
      </filter>

      <!-- Button pulse filter -->
      <filter
        :id="`${id}-pulse`"
        x="-60%"
        y="-60%"
        width="220%"
        height="220%"
      >
        <feGaussianBlur
          stdDeviation="4"
          result="blur"
        />
        <feComposite
          in="SourceGraphic"
          in2="blur"
          operator="over"
        />
      </filter>

      <!-- Clip to circle -->
      <clipPath :id="`${id}-clip`">
        <circle
          cx="50"
          cy="50"
          r="44"
        />
      </clipPath>
    </defs>

    <!-- Outer energy ring -->
    <circle
      v-if="glowing"
      cx="50"
      cy="50"
      r="48"
      stroke="#F6C945"
      stroke-width="1.5"
      stroke-opacity="0.35"
      fill="none"
      :filter="`url(#${id}-glow)`"
    >
      <animate
        attributeName="stroke-opacity"
        values="0.15;0.5;0.15"
        dur="2.4s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="r"
        values="47;49;47"
        dur="2.4s"
        repeatCount="indefinite"
      />
    </circle>

    <!-- Ball body -->
    <g :clip-path="`url(#${id}-clip)`">
      <!-- Top half -->
      <rect
        x="6"
        y="6"
        width="88"
        height="44"
        :fill="`url(#${id}-top)`"
      />

      <!-- Bottom half -->
      <rect
        x="6"
        y="50"
        width="88"
        height="44"
        :fill="`url(#${id}-bot)`"
      />

      <!-- Gold horizontal band -->
      <rect
        x="6"
        y="43"
        width="88"
        height="14"
        :fill="`url(#${id}-band)`"
      />

      <!-- Top-half sheen -->
      <ellipse
        cx="50"
        cy="26"
        rx="28"
        ry="10"
        fill="white"
        fill-opacity="0.045"
      />

      <!-- Gold rim lines -->
      <line
        x1="6"
        y1="43"
        x2="94"
        y2="43"
        stroke="#F6C945"
        stroke-width="0.8"
        stroke-opacity="0.6"
      />

      <line
        x1="6"
        y1="57"
        x2="94"
        y2="57"
        stroke="#C89A1A"
        stroke-width="0.8"
        stroke-opacity="0.5"
      />
    </g>

    <!-- Outer gold rim -->
    <circle
      cx="50"
      cy="50"
      r="44"
      stroke="#F6C945"
      stroke-width="2.5"
      stroke-opacity="0.75"
      fill="none"
    />

    <!-- Inner shadow ring -->
    <circle
      cx="50"
      cy="50"
      r="44"
      stroke="#080C17"
      stroke-width="1"
      stroke-opacity="0.5"
      fill="none"
    />

    <!-- Button pulse glow -->
    <circle
      v-if="glowing"
      cx="50"
      cy="50"
      r="13"
      fill="#F6C945"
      fill-opacity="0.25"
      :filter="`url(#${id}-pulse)`"
    >
      <animate
        attributeName="r"
        values="11;15;11"
        dur="2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="fill-opacity"
        values="0.2;0.45;0.2"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>

    <!-- Dark outer button ring -->
    <circle
      cx="50"
      cy="50"
      r="11.5"
      fill="#080C17"
      stroke="#F6C945"
      stroke-width="2.5"
      stroke-opacity="0.9"
    />

    <!-- Gold button face -->
    <circle
      cx="50"
      cy="50"
      r="8"
      :fill="`url(#${id}-btn)`"
    />

    <!-- Button highlight -->
    <ellipse
      cx="47.5"
      cy="47"
      rx="3.5"
      ry="2"
      fill="white"
      fill-opacity="0.35"
    />
  </svg>
</template>