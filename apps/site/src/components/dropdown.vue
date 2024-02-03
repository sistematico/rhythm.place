<script setup lang="ts">
import { store } from "../store.ts";
</script>
<template>
  <div class="dropdown">
    <button class="dropbtn">{{ store.genre }}</button>
    <div class="dropdown-content">
      <a href="javascript:void(0)" @click="store.genre = 'Principal'">Principal</a>
      <a href="javascript:void(0)" @click="store.genre = 'Dance'">Dance</a>
      <a href="javascript:void(0)" @click="store.genre = 'Rock'">Rock</a>
      <a href="javascript:void(0)" @click="store.genre = 'Nineties'">90s</a>
      <a href="javascript:void(0)" @click="store.genre = 'Eighties'">80s</a>
      <a href="javascript:void(0)" @click="store.genre = 'Seventies'">70s</a>
    </div>
  </div>
</template>
<style>
.dropbtn {
  background-color: #fff;
  color: rgba(0, 0, 0, 0.8);
  padding: 16px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  min-width: 160px;
  box-shadow: 0 0 3px 4px rgba(0, 0, 0, 0.2); /* offset-x | offset-y | blur-radius | spread-radius | color */
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  border-radius: 5px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

/* .dropdown:hover .dropbtn {
  background-color: #3e8e41;
} */
</style>
