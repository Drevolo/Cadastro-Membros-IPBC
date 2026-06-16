document.addEventListener('DOMContentLoaded', () => { carregar(); });

async function carregar() {
    const params = new URLSearchParams();
    document.querySelectorAll('[id^="filtro-"]').forEach(el => {
        const campo = el.id.replace('filtro-', '');
        if (el.value) params.set(campo, el.value);
    });
    const res = await fetch('/api/membros?' + params.toString());
    const json = await res.json();
    const tbody = document.getElementById('tabelaMembros');
    tbody.innerHTML = '';
    document.getElementById('totalRegistros').textContent = json.total + ' registro(s)';

    if (json.data.length === 0) {
        document.getElementById('emptyState').classList.remove('d-none');
    } else {
        document.getElementById('emptyState').classList.add('d-none');
        json.data.forEach(m => {
            const tr = document.createElement('tr');
            tr.className = 'cursor-pointer';
            tr.onclick = () => { editar(m.id); };
            const sexoLabel = m.sexo === 'Masculino'
                ? '<span class="badge badge-sexo-m">M</span>'
                : m.sexo === 'Feminino'
                ? '<span class="badge badge-sexo-f">F</span>'
                : '-';
            tr.innerHTML = `
                <td>${m.id}</td>
                <td><strong>${esc(m.nome)}</strong></td>
                <td>${sexoLabel}</td>
                <td class="small">${formatDate(m.nascimento_data)}${m.nascimento_cidade ? '<br>' + esc(m.nascimento_cidade) : ''}${m.nascimento_estado ? '/' + esc(m.nascimento_estado) : ''}</td>
                <td class="small">${m.pai ? 'Pai: ' + esc(m.pai) + (m.pai_religiao ? ' (' + esc(m.pai_religiao) + ')' : '') : ''}${m.mae ? '<br>M&atilde;e: ' + esc(m.mae) + (m.mae_religiao ? ' (' + esc(m.mae_religiao) + ')' : '') : ''}</td>
                <td class="small">${formatDate(m.batismo_data)}${m.batismo_local ? '<br>' + esc(m.batismo_local) : ''}${m.batismo_oficiante ? '<br><em>' + esc(m.batismo_oficiante) + '</em>' : ''}</td>
                <td class="small">${formatDate(m.admissao_data)}${m.admissao_modo ? '<br>' + esc(m.admissao_modo) : ''}${m.admissao_deonde ? '<br>De: ' + esc(m.admissao_deonde) : ''}${m.admissao_oficiante ? '<br><em>' + esc(m.admissao_oficiante) + '</em>' : ''}</td>
                <td>${esc(m.livro_numero)}</td>
                <td>${esc(m.ato_numero)}</td>
                <td class="small">${esc(m.endereco)}</td>
                <td>${esc(m.igreja)}</td>
                <td onclick="event.stopPropagation()">
                    <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="deletar(${m.id})" title="Excluir">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function filtrar() { carregar(); }

function limparFiltros() {
    document.querySelectorAll('[id^="filtro-"]').forEach(el => el.value = '');
    carregar();
}

function limparForm() {
    document.getElementById('membro-id').value = '';
    document.querySelectorAll('#inserir [id^="form-"]').forEach(el => el.value = '');
    document.getElementById('formStatus').textContent = 'Novo';
    document.getElementById('btnCancelar').style.display = 'none';
}

function preencherForm(m) {
    document.getElementById('membro-id').value = m.id;
    document.getElementById('form-nome').value = m.nome || '';
    document.getElementById('form-sexo').value = m.sexo || '';
    document.getElementById('form-nascimento_data').value = m.nascimento_data || '';
    document.getElementById('form-nascimento_cidade').value = m.nascimento_cidade || '';
    document.getElementById('form-nascimento_estado').value = m.nascimento_estado || '';
    document.getElementById('form-pai').value = m.pai || '';
    document.getElementById('form-pai_religiao').value = m.pai_religiao || '';
    document.getElementById('form-mae').value = m.mae || '';
    document.getElementById('form-mae_religiao').value = m.mae_religiao || '';
    document.getElementById('form-batismo_data').value = m.batismo_data || '';
    document.getElementById('form-batismo_local').value = m.batismo_local || '';
    document.getElementById('form-batismo_oficiante').value = m.batismo_oficiante || '';
    document.getElementById('form-admissao_data').value = m.admissao_data || '';
    document.getElementById('form-admissao_modo').value = m.admissao_modo || '';
    document.getElementById('form-admissao_deonde').value = m.admissao_deonde || '';
    document.getElementById('form-admissao_oficiante').value = m.admissao_oficiante || '';
    document.getElementById('form-livro_numero').value = m.livro_numero || '';
    document.getElementById('form-ato_numero').value = m.ato_numero || '';
    document.getElementById('form-endereco').value = m.endereco || '';
    document.getElementById('form-igreja').value = m.igreja || '';
    document.getElementById('formStatus').textContent = 'Editando #' + m.id;
    document.getElementById('btnCancelar').style.display = 'inline-block';
    document.querySelector('#tab-inserir').click();
}

async function editar(id) {
    const res = await fetch('/api/membros');
    const json = await res.json();
    const membro = json.data.find(m => m.id === id);
    if (membro) preencherForm(membro);
}

async function salvar() {
    const id = document.getElementById('membro-id').value;
    const data = {
        nome: document.getElementById('form-nome').value,
        sexo: document.getElementById('form-sexo').value,
        nascimento_data: document.getElementById('form-nascimento_data').value,
        nascimento_cidade: document.getElementById('form-nascimento_cidade').value,
        nascimento_estado: document.getElementById('form-nascimento_estado').value,
        pai: document.getElementById('form-pai').value,
        pai_religiao: document.getElementById('form-pai_religiao').value,
        mae: document.getElementById('form-mae').value,
        mae_religiao: document.getElementById('form-mae_religiao').value,
        batismo_data: document.getElementById('form-batismo_data').value,
        batismo_local: document.getElementById('form-batismo_local').value,
        batismo_oficiante: document.getElementById('form-batismo_oficiante').value,
        admissao_data: document.getElementById('form-admissao_data').value,
        admissao_modo: document.getElementById('form-admissao_modo').value,
        admissao_deonde: document.getElementById('form-admissao_deonde').value,
        admissao_oficiante: document.getElementById('form-admissao_oficiante').value,
        livro_numero: document.getElementById('form-livro_numero').value,
        ato_numero: document.getElementById('form-ato_numero').value,
        endereco: document.getElementById('form-endereco').value,
        igreja: document.getElementById('form-igreja').value
    };

    const url = id ? `/api/membros/${id}` : '/api/membros';
    const method = id ? 'PUT' : 'POST';

    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    limparForm();
    carregar();
}

async function deletar(id) {
    if (!confirm('Tem certeza que deseja excluir este membro?')) return;
    await fetch(`/api/membros/${id}`, { method: 'DELETE' });
    if (document.getElementById('membro-id').value == id) limparForm();
    carregar();
}

function exportarCSV() {
    fetch('/api/membros')
        .then(r => r.json())
        .then(json => {
            if (json.data.length === 0) { alert('Nenhum registro para exportar'); return; }
            const headers = ['ID','Nome','Sexo','Nascimento Data','Nascimento Cidade','Nascimento Estado',
                'Pai','Religião (Pai)','Mãe','Religião (Mãe)',
                'Batismo Data','Batismo Local','Batismo Oficiante',
                'Admissão Data','Admissão Modo','Admissão De Onde','Admissão Oficiante',
                'Livro nº','Ato nº','Endereço','Igreja'];
            const rows = json.data.map(m => [
                m.id, m.nome, m.sexo,
                m.nascimento_data, m.nascimento_cidade, m.nascimento_estado,
                m.pai, m.pai_religiao, m.mae, m.mae_religiao,
                m.batismo_data, m.batismo_local, m.batismo_oficiante,
                m.admissao_data, m.admissao_modo, m.admissao_deonde, m.admissao_oficiante,
                m.livro_numero, m.ato_numero, m.endereco, m.igreja
            ].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','));
            const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'membros.csv';
            a.click();
        });
}

function esc(s) { return s ? s.replace(/</g,'&lt;').replace(/>/g,'&gt;') : '-'; }
function formatDate(d) { return d ? d : ''; }
