import vituum from 'vituum'
import pug from '@vituum/vite-plugin-pug'

export default {
    base: 'http://bevolgayan.temp.swtest.ru/promo/auto_2/',
    build: {
        minify: false,
        cssMinify: false,
        terserOptions: {compress: false, mangle: false}
    },
    plugins: [vituum(
        {
            imports: {
                filenamePattern: {
                    '+.css': [],
                    '+.sass': 'src/styles'
                }
            },
            input: [
                './src/assets/images/*.*'
            ]
        }
    ), pug({
        root: './src'
    })],
}