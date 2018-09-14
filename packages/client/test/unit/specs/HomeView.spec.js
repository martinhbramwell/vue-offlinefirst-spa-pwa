import Vue from 'vue';
import HomeView from '@/components/HomeView';

describe('HomeView.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(HomeView);
    const vm = new Constructor().$mount();
    expect(vm.$el.querySelector('.hello h1').textContent)
      .to.equal('Welcome to Your Vue.js PWA');
  });
});
