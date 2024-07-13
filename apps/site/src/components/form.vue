<script setup lang="ts">
import { store } from "../store.ts";
</script>
<template>
  <form action="/action_page.php">
    <label for="fname">Pesquise a música ou artista:</label>
    <input type="text" id="fname" name="fname"><br><br>
    <input type="submit" value="Submit">
  </form> 
</template>