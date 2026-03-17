const DEV = true;

export async function fetchJSON(path) {
    const bust = DEV ? '?t=' + Date.now() : '';
    const response = await fetch(path + bust);
    if (!response.ok) throw new Error(`fetchJSON: can't load "${path}" (${response.status})`);
    return response.json();
}

export async function fetchSVG(path) {
  
    const bust     = DEV ? '?t=' + Date.now() : '';
    const response = await fetch(path + bust);
    if (!response.ok) throw new Error(`fetchSVG: can't load "${path}" (${response.status})`);

    const text   = await response.text();
    const parser = new DOMParser();
    const doc    = parser.parseFromString(text, 'image/svg+xml');

    const error = doc.querySelector('parsererror');
    if (error) throw new Error(`fetchSVG: invalid SVG in "${path}"\n${error.textContent}`);

    const sprites = {};
    doc.querySelectorAll('svg > g[id]').forEach(g => {
        sprites[g.id] = g;
    });

    return sprites;
}
