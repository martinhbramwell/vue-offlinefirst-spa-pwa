import LoadingIndicator from './LoadingIndicator';

const LG = console.log; // eslint-disable-line no-unused-vars, no-console

export default {
  components: { LoadingIndicator },

  data() {
    return {
      loading: false,
    };
  },

  methods: {
    async onInit(promise) {
      this.loading = true;

      try {
        await promise;

        this.$emit('success');
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.$emit('error', 'To detect and decode QR codes this page needs access to your camera');
        } else if (error.name === 'NotFoundError') {
          this.$emit('error', 'Seems like you have no suitable camera on your device.');
        } else if (error.name === 'NotSupportedError') {
          this.$emit('error', 'Seems like this page is served in non-secure context. Your browser doesn\'t support that');
        } else if (error.name === 'NotReadableError') {
          this.$emit('error', 'Couldn\'t access your camera. Is it already in use?');
        } else if (error.name === 'OverconstrainedError') {
          this.$emit('error', 'Constraints don\'t match any installed camera. Did you asked for the front camera although there is none?');
        } else {
          this.$emit('error', `UNKNOWN ERROR: ${error.message}`);

          LG(error);
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
