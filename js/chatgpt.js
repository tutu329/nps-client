const app = Vue.createApp({
    data() {
        return {
            messages: [
                { id: 1, user: 'Alice', text: 'Hello!' },
                { id: 2, user: 'Bob', text: 'Hi there!' },
                { id: 3, user: 'Alice', text: 'How are you doing?' },
                { id: 4, user: 'Bob', text: 'I am doing well, thanks for asking!' }
            ],
            newMessage: '',
            showSystemSettings: false,
            showChatSettings: false
        }
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim() !== '') {
                this.messages.push({
                    id: this.messages.length + 1,
                    user: 'Me',
                    text: this.newMessage
                });
                this.newMessage = '';
            }
        },
        toggleSystemSettings() {
            this.showSystemSettings = !this.showSystemSettings;
        },
        toggleChatSettings() {
            this.showChatSettings = !this.showChatSettings;
        }
    }
});

app.mount('#app');
