import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'
import babel from 'vite-plugin-babel';
import macrosPlugin from "vite-plugin-babel-macros"
export default {
    plugins: [
      // other plugins...
      babel(),
      macrosPlugin(),
      crossOriginIsolation()
    ]
}