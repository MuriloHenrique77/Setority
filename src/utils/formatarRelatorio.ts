/**
 * Formata quantidades e datas quando histórico, cartões e relatórios exibem dados.
 * Depende de Intl, recurso do JavaScript para formatação conforme o idioma.
 * Devolve texto em português brasileiro, sem mudar os valores armazenados.
 */

const numeros = new Intl.NumberFormat('pt-BR');
const datas = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
export const formatarQuantidadeRelatorio = (quantidade: number) => numeros.format(quantidade);
export const formatarDataRelatorio = (data: Date) => datas.format(data);
