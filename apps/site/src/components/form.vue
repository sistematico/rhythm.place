<script setup lang="ts">
// import { store } from '@/store.ts'
</script>
<template>
  <form>
    <input type="text" name="search" placeholder="Pesquise a música ou artista..">
  </form>
</template>
<style scoped>
input[type=text] {
  width: 130px;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  background-image: url('/img/search.png');
  background-position: 10px 10px; 
  background-repeat: no-repeat;
  padding: 12px 20px 12px 40px;
  transition: width 0.4s ease-in-out;
}

input[type=text]:focus {
  width: 100%;
}
</style>