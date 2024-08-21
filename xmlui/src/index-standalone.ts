import { startApp } from "@components-core/StandaloneApp";

document.addEventListener('DOMContentLoaded', function() {
  if(!document.getElementById("root")){
    // Your existing code unmodified...
    const div = document.createElement('div');
    div.id = 'root';
    document.getElementsByTagName('body')[0].appendChild(div);
  }
  startApp();
});