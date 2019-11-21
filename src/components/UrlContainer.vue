<template>
  <div>
    <a :href="urls[0].url" target="_blank">{{name}}</a>
      <span class="pt-hover-container">[+]
        <span class="pt-hover-menu">
          <ul>
            <li v-for="item in urls">
              <a :href="item.url" target="_blank">{{item.text}}</a>
            </li>
          </ul>
        </span>
      </span>
    </a>
  </div>
</template>

<script>

export default {
  name: 'UrlContainer',
  props: {
    urls: Array,
    name: String
  }
};
</script>

<style lang="scss">
.pt-hover-menu {
  position: absolute;
  padding: 8px;
  background-color: #FFF;
  border: 1px solid #808080;
  display:none;
}
.pt-hover-container:hover .pt-hover-menu {
  display: inline;
}
a {
  font-size:100%;
  font-weight:600;
}
ul {
  list-style-type: none;
  padding-inline-start: 5px;
  margin-block-start: 0.5em
}
</style>
