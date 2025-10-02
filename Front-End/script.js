const botao_estoque = document.getElementById('botao_estoque');
const sub_menu_estoque = document.getElementById('sub_menu_estoque');

botao_estoque.addEventListener('click', () => {
    if (sub_menu_estoque.style.display === 'none'){
        sub_menu_estoque.style.display = 'block';
        botao_estoque.style.borderLeft = '3px solid var(--ciano)';
    }
    else{
        sub_menu_estoque.style.display ='none';
        botao_estoque.style.border = 'none';
    }

    
})