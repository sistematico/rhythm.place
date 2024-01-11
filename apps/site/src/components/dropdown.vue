<script setup lang="ts">
import { store } from "../store.ts";
</script>
<template>
  <div class="dropdown">
    <button class="dropbtn">{{ store.genre }}</button>
    <div class="dropdown-content">
      <a href="#" @click="store.genre = 'Dance'">Dance</a>
      <a href="#" @click="store.genre = 'Rock'">Rock</a>
    </div>
  </div>
</template>
<style>
.dropbtn {
  background-color: #4caf50;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  min-width: 160px;
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
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
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

.dropdown:hover .dropbtn {
  background-color: #3e8e41;
}
</style>
