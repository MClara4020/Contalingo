import { test, expect } from '@playwright/test';
const keys=[[2,0,3,1,3],[0,1,2,3,0],[1,3,2,0,1]];

test('cadastro por matrícula, derrota com feedback, jornada perfeita, resultado e novo login',async({page})=>{
  const matricula=`E2E-${Date.now()}`;
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button',{name:'Criar conta',exact:true}).click();
  await page.getByLabel('Nome completo').fill('Aluno de Teste');
  await page.getByLabel('Matrícula',{exact:true}).fill(matricula);
  await page.getByLabel('Senha',{exact:true}).fill('Senha-de-teste123');
  await page.getByRole('button',{name:'Criar conta',exact:true}).click();
  await expect(page.getByRole('heading',{name:/Bem-vindo à firma/})).toBeVisible();
  await page.getByRole('main').getByRole('button',{name:'Como jogar',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Somente a melhor tentativa');
  await page.getByRole('button',{name:'Entendi'}).click();
  await page.getByRole('button',{name:'Jogar',exact:true}).click();
  await expect(page.locator('.phase-card').nth(1)).toBeDisabled();
  await expect(page.locator('.phase-card').nth(2)).toBeDisabled();
  await page.screenshot({path:'test-results/jornada-desktop.png',fullPage:true});
  await page.locator('.phase-card').first().click();
  await expect(page.getByRole('button',{name:'Próxima'})).toHaveCount(0);
  for(let i=0;i<3;i++){
    await page.locator('.answer').nth((keys[0][i]+1)%4).click();
    await expect(page.locator('.feedback')).toContainText('Incorreto');
    await expect(page.locator('.feedback')).toContainText('Por que a sua está errada');
    await expect(page.locator('.feedback')).toContainText('Próximo passo');
    await expect(page.locator('.feedback')).toContainText('Conteúdo: item 4.4');
    if(i===2){await expect(page.getByRole('heading',{name:'Suas vidas acabaram'})).toHaveCount(0);}
    await page.getByRole('button',{name:i===2?'Ver resultado':'Próxima'}).click();
  }
  await expect(page.getByRole('heading',{name:'Suas vidas acabaram'})).toBeVisible();
  await expect(page.getByRole('img',{name:'Nenhuma vida restante'})).toBeVisible();
  await expect(page.locator('.phase-lost-subtitle')).toHaveText('Você acertou 0 de 5 na Fase 1.');
  await expect(page.locator('.phase-lost-tip')).toContainText('item 4.4');
  await page.getByRole('button',{name:'Voltar ao mapa',exact:true}).click();
  await expect(page.locator('.phase-card').nth(1)).toBeDisabled();
  await page.locator('.phase-card').first().click();
  for(let i=0;i<3;i++){
    await page.locator('.answer').nth((keys[0][i]+1)%4).click();
    await page.getByRole('button',{name:i===2?'Ver resultado':'Próxima',exact:true}).click();
  }
  await page.screenshot({path:'test-results/derrota.png',fullPage:true});
  await page.getByRole('button',{name:'Tentar novamente'}).click();
  await expect(page.getByLabel('3 vidas restantes')).toBeVisible();
  for(let phase=0;phase<3;phase++){
    for(let i=0;i<5;i++){
      if(phase===2&&i===2)await expect(page.locator('.negation')).toHaveText('NÃO');
      await page.locator('.answer').nth(keys[phase][i]).click();
      await expect(page.locator('.feedback')).toContainText('Correto! +10 pontos');
      await expect(page.locator('.feedback-mistake')).toHaveCount(0);
      await page.getByRole('button',{name:i===4?'Concluir fase':'Próxima'}).click();
    }
    await expect(page.getByRole('heading',{name:'Fase concluída!'})).toBeVisible();
    await expect(page.locator('.phase-complete-summary')).toContainText('+5');
    await expect(page.locator('.phase-complete-total')).toContainText('55 pts');
    await expect(page.getByRole('img',{name:'3 de 3 estrelas'})).toBeVisible();
    await page.getByRole('button',{name:'Continuar',exact:true}).click();
    await expect(page.locator('.journey-result-score')).toHaveText(`${(phase+1)*55} de 165 pontos`);
    await expect(page.getByRole('heading',{name:['Estagiário','Auditor Sênior','Sócio'][phase],exact:true})).toBeVisible();
    await expect(page.locator('.journey-result-summary>div')).toHaveCount(3);
    if(phase<2){
      await expect(page.locator('.journey-result-summary>div').nth(phase+1)).toContainText('Pendente');
      await page.getByRole('button',{name:'Voltar ao mapa',exact:true}).click();
      await expect(page.locator('.phase-card').nth(phase+1)).toBeEnabled();
      await page.locator('.phase-card').nth(phase+1).click();
    }
  }
  await expect(page.locator('.journey-result-score')).toHaveText('165 de 165 pontos');
  await expect(page.getByRole('heading',{name:'Sócio',exact:true})).toBeVisible();
  await expect(page.locator('.journey-result-summary>div')).toHaveCount(3);
  await expect(page.locator('.journey-result-caption')).toContainText('Jogo concluído!');
  await page.screenshot({path:'test-results/resumo-patente.png',fullPage:true});
  await page.getByRole('button',{name:'Voltar ao mapa',exact:true}).click();
  await page.getByRole('button',{name:'Sair',exact:true}).click();
  await page.getByLabel('Matrícula',{exact:true}).fill(matricula.toLowerCase());
  await page.getByLabel('Senha',{exact:true}).fill('Senha-de-teste123');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await page.getByRole('button',{name:'Jogar',exact:true}).click();
  await expect(page.locator('.score')).toContainText('165');
  await expect(page.locator('.phase-card').nth(2)).toBeEnabled();
  await page.getByRole('button',{name:'Ver meu resultado'}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Jogar novamente',exact:true}).click();
  await expect(page.locator('.score')).toHaveText('0 pts');
  await expect(page.locator('.phase-card').nth(1)).toBeDisabled();
  await page.locator('.phase-card').first().click();
  await expect(page.getByLabel('3 vidas restantes')).toBeVisible();
  await page.getByRole('button',{name:'Voltar à jornada',exact:true}).click();
  await expect(page.locator('.phase-card').first()).toBeVisible();
  await page.getByRole('button',{name:'Sair',exact:true}).click();
  await expect(page.getByRole('form',{name:'Login'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('cadastro e jogo permanecem utilizáveis em tela de celular',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button',{name:'Criar conta',exact:true}).click();
  await page.getByLabel('Nome completo').fill('Aluna Mobile');
  await page.getByLabel('Matrícula',{exact:true}).fill(`MOB-${Date.now()}`);
  await page.getByLabel('Senha',{exact:true}).fill('Senha-de-teste123');
  await page.getByRole('button',{name:'Criar conta',exact:true}).click();
  await page.getByRole('button',{name:'Jogar',exact:true}).click();
  await expect(page.locator('.phase-card').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.locator('.phase-card').first().click();
  await expect(page.getByText('Pergunta 1 de 5',{exact:true})).toBeVisible();
  await expect(page.getByLabel('3 vidas restantes')).toBeVisible();
  await expect(page.getByLabel('0 pontos',{exact:true})).toBeVisible();
  await expect(page.locator('.answer')).toHaveCount(4);
  await page.screenshot({path:'test-results/pergunta-celular.png',fullPage:true});
  await page.locator('.answer').nth(0).click();
  await expect(page.locator('.feedback')).toContainText('Conteúdo: item 4.4');
  await expect(page.locator('.answer.wrong')).toHaveCount(1);
  await expect(page.locator('.answer.right')).toHaveCount(1);
  await expect(page.locator('.quiz-feedback-banner')).toContainText('Resposta correta: C');
  await expect(page.getByLabel('2 vidas restantes')).toBeVisible();
  await expect(page.locator('.answer:disabled')).toHaveCount(4);
  await page.screenshot({path:'test-results/feedback-celular.png',fullPage:true});
  expect(await page.locator('.feedback-scroll').evaluate(el=>el.scrollHeight>=el.clientHeight)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Próxima'}).click();
  await expect(page.locator('.scenario-label')).toContainText('Delegando a contagem');
});
