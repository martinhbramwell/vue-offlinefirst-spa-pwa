<template>
  <main>
    <button data-cyp="fetch-articles" class="fetch-articles" @click="onFetchArticles">Fetch Articles</button>
    <button class="create-article" @click="onCreateArticle">Create New Article</button>

    <div id="articles" v-if="articles.length">
      <blog-article
        v-for="article in articles"
        :article="article"
        :key="article.id" />
         <!--  -->
    </div>
  </main>
</template>

<script>
  /* eslint-disable import/no-extraneous-dependencies */
  import { mapActions, mapGetters } from 'vuex';
  import Ipsum from 'bavaria-ipsum';
  /* eslint-enable */
  import ArticleDetail from './ArticleDetail';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  const ipsum = new Ipsum();

  export default {
    name: 'Blog',
    components: {
      'blog-article': ArticleDetail,
    },

    computed: {
      ...mapGetters('articles', {
        articles: 'list',
      }),
    },

    methods: {
      onFetchArticles() {
        LG(' * * Try to fetch articles * *');
        this.fetchArticles()
          .then(() => { LG(' * * Fetched articles * *'); })
          .catch((e) => {
            LG(`*** Error while fetching articles :: ${e}***`);
          });
      },

      onCreateArticle() {
        this.createArticle({
          data: {
            title: ipsum.generateSentence(),
            content: ipsum.generateParagraph(),
          },
        });
      },

      ...mapActions('articles', {
        fetchArticles: 'fetchList',
        createArticle: 'create',
      }),
    },
  };
</script>
