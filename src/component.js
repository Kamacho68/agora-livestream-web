import logo from './agora-logo.svg';

function component() {
    let m = document.createElement('main');
    let p = document.createElement('p');
    let img = document.createElement('img');
    m.append(p);
    p.append(img);
    img.src = logo;
    img.alt = 'Agora logo';
    return m;
}

export default component;