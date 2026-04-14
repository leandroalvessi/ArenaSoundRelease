const repoOwner = 'leandroalvessi';
const repoName = 'ArenaSoundRelease';
const apiBaseUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases`;

const platformMatchers = {
  windows: [/\.exe$/i, /setup/i, /installer/i],
  mac: [/\.dmg$/i],
  linux: [/\.appimage$/i]
};

let releasesCache = [];

function formatCount(value) {
  return new Intl.NumberFormat('pt-BR').format(value || 0);
}

function findAsset(assets, platform) {
  const matchers = platformMatchers[platform] || [];
  return assets.find((asset) => matchers.some((matcher) => matcher.test(asset.name)));
}

function setText(id, text) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = text;
}

function getReleaseLabel(release) {
  const publishedAt = release?.published_at ? new Date(release.published_at).toLocaleDateString('pt-BR') : 'sem data';
  const tag = release?.tag_name || 'sem tag';
  return `${tag} - ${publishedAt}`;
}

function extractCounts(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const windowsCount = findAsset(assets, 'windows')?.download_count || 0;
  const macCount = findAsset(assets, 'mac')?.download_count || 0;
  const linuxCount = findAsset(assets, 'linux')?.download_count || 0;

  return {
    windows: windowsCount,
    mac: macCount,
    linux: linuxCount,
    total: windowsCount + macCount + linuxCount
  };
}

function renderSelectedReleaseStats(release) {
  if (!release) {
    setText('selectedReleaseTitle', 'Downloads da release selecionada');
    setText('countWindows', '--');
    setText('countMac', '--');
    setText('countLinux', '--');
    setText('countTotal', 'Total: --');
    return;
  }

  const counts = extractCounts(release);

  setText('selectedReleaseTitle', `Downloads de ${release.tag_name || 'release'}`);
  setText('countWindows', formatCount(counts.windows));
  setText('countMac', formatCount(counts.mac));
  setText('countLinux', formatCount(counts.linux));
  setText('countTotal', `Total: ${formatCount(counts.total)}`);
}

function renderHistoryStats(releases) {
  const history = releases.reduce((acc, release) => {
    const counts = extractCounts(release);
    acc.windows += counts.windows;
    acc.mac += counts.mac;
    acc.linux += counts.linux;
    acc.total += counts.total;
    return acc;
  }, { windows: 0, mac: 0, linux: 0, total: 0 });

  setText('historyWindows', formatCount(history.windows));
  setText('historyMac', formatCount(history.mac));
  setText('historyLinux', formatCount(history.linux));
  setText('historyTotal', `Total: ${formatCount(history.total)}`);
}

function fillReleaseSelect(releases) {
  const select = document.getElementById('releaseSelect');
  if (!select) return;

  select.innerHTML = '';

  for (const release of releases) {
    const option = document.createElement('option');
    option.value = release.id;
    option.textContent = getReleaseLabel(release);
    select.appendChild(option);
  }

  if (releases[0]?.id) {
    select.value = String(releases[0].id);
  }

  select.onchange = () => {
    const selectedId = Number(select.value);
    const selectedRelease = releasesCache.find((release) => release.id === selectedId);
    renderSelectedReleaseStats(selectedRelease);
  };
}

async function fetchAllReleases() {
  const perPage = 100;
  let page = 1;
  const allReleases = [];

  while (true) {
    const response = await fetch(`${apiBaseUrl}?per_page=${perPage}&page=${page}`, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API respondeu com ${response.status}`);
    }

    const pageData = await response.json();
    if (!Array.isArray(pageData) || pageData.length === 0) break;

    allReleases.push(...pageData);

    if (pageData.length < perPage) break;
    page += 1;
  }

  return allReleases;
}

async function loadDownloadCounts() {
  try {
    releasesCache = await fetchAllReleases();

    if (!releasesCache.length) {
      throw new Error('Nenhuma release encontrada');
    }

    fillReleaseSelect(releasesCache);
    renderSelectedReleaseStats(releasesCache[0]);
    renderHistoryStats(releasesCache);
    setText('statsUpdatedAt', `Atualizado em: ${new Date().toLocaleString('pt-BR')}`);
  } catch (error) {
    setText('countWindows', '--');
    setText('countMac', '--');
    setText('countLinux', '--');
    setText('countTotal', 'Total: --');
    setText('historyWindows', '--');
    setText('historyMac', '--');
    setText('historyLinux', '--');
    setText('historyTotal', 'Total: --');
    setText('selectedReleaseTitle', 'Downloads da release selecionada');
    setText('statsUpdatedAt', 'Nao foi possivel carregar os downloads agora.');
    console.error(error);
  }
}

document.getElementById('refreshStats')?.addEventListener('click', loadDownloadCounts);

loadDownloadCounts();
