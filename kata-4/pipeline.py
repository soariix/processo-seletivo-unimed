import pandas as pd
import numpy as np
import unicodedata
import os

# Caminhos dos arquivos
BASE_DIR = os.path.dirname(os.path.abspath(__line__)) if '__line__' in globals() else os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'dados')

def normalize_text(text):
    """Remove acentos, espaços extras e converte para caixa alta"""
    if pd.isna(text):
        return text
    text = str(text).strip().upper()
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')
    return text

def parse_mixed_dates(series):
    """Trata formatos de data mista (YYYY-MM-DD, DD/MM/YYYY, Timestamps)"""
    def convert(val):
        if pd.isna(val) or val == '':
            return pd.NaT
        val_str = str(val).strip()
        # Se for somente números, tratamos como Timestamp Unix
        if val_str.isnumeric():
            return pd.to_datetime(int(val_str), unit='s')
        # Senão, usamos a inteligência do pandas com dayfirst para os DD/MM
        return pd.to_datetime(val_str, dayfirst=True, format='mixed', errors='coerce')
    
    return series.apply(convert)

def run_pipeline():
    print(" Iniciando Pipeline de Transformação de Dados...")
    
    try:
        df_clientes = pd.read_csv(os.path.join(DATA_DIR, 'clientes.csv'))
        df_pedidos = pd.read_csv(os.path.join(DATA_DIR, 'pedidos.csv'))
        df_entregas = pd.read_csv(os.path.join(DATA_DIR, 'entregas.csv'))
    except FileNotFoundError as e:
        print(f" Erro ao ler arquivos: {e}")
        return

    df_clientes['cidade_normalizada'] = df_clientes['cidade'].apply(normalize_text)
    
    # Tratamento de valores monetários (vírgula por ponto)
    df_pedidos['valor_total'] = (
        df_pedidos['valor_total']
        .astype(str)
        .str.replace('"', '')
        .str.replace(',', '.')
        .astype(float)
    )
    df_pedidos['data_pedido'] = parse_mixed_dates(df_pedidos['data_pedido'])
    
    df_entregas['data_prevista'] = parse_mixed_dates(df_entregas['data_prevista'])
    df_entregas['data_realizada'] = parse_mixed_dates(df_entregas['data_realizada'])
    
    # Tratando nulos (Dropando pedidos sem clientes válidos e com valores nulos)
    df_pedidos = df_pedidos.dropna(subset=['id_cliente'])

    # Left join dos pedidos com clientes
    df_consolidado = pd.merge(
        df_pedidos, 
        df_clientes, 
        how='left', 
        left_on='id_cliente', 
        right_on='id_cliente'
    )
    
    # Left join com entregas -> O Left Join resolve o problema dos registros ORFAOS!
    # Entregas sem id_pedido existente na tabela de pedidos serão naturalmente descartadas.
    df_consolidado = pd.merge(
        df_consolidado,
        df_entregas,
        how='left',
        on='id_pedido'
    )
    
    df_consolidado['atraso_dias'] = (
        df_consolidado['data_realizada'] - df_consolidado['data_prevista']
    ).dt.days
    
    # Renomeando as colunas finais conforme escopo exigido
    df_final = df_consolidado[[
        'id_pedido', 'nome', 'cidade_normalizada', 'estado', 'valor_total', 'status',
        'data_pedido', 'data_prevista', 'data_realizada', 'atraso_dias', 'status_entrega'
    ]].copy()
    
    df_final.rename(columns={
        'nome': 'nome_cliente', 
        'status': 'status_pedido',
        'data_prevista': 'data_prevista_entrega',
        'data_realizada': 'data_realizada_entrega'
    }, inplace=True)
    
    # Gerando o CSV final
    output_path = os.path.join(BASE_DIR, 'relatorio_consolidado.csv')
    df_final.to_csv(output_path, index=False, sep=';', encoding='utf-8')
    print(f" Arquivo consolidado salvo em: {output_path}")
    
    print("\n---  RELATÓRIO DE DESEMPENHO (KPIs) ---")
    
    print("\n Total de pedidos por status:")
    print(df_final.groupby('status_pedido')['id_pedido'].count().to_string())
    
    print("\n Ticket médio por estado:")
    print(df_final.groupby('estado')['valor_total'].mean().apply(lambda x: f"R$ {x:.2f}").to_string())
    
    tot_entregas = df_final['atraso_dias'].notna().sum()
    if tot_entregas > 0:
        no_prazo = (df_final['atraso_dias'] <= 0).sum()
        com_atraso = (df_final['atraso_dias'] > 0).sum()
        print(f"\n Percentual de Entregas: {no_prazo/tot_entregas*100:.1f}% no Prazo | {com_atraso/tot_entregas*100:.1f}% Atrasadas")
    
    print("\n Top 3 Cidades com maior volume de pedidos:")
    print(df_final['cidade_normalizada'].value_contents().head(3).to_string() if hasattr(df_final['cidade_normalizada'], 'value_counts') else df_final['cidade_normalizada'].value_counts().head(3).to_string())
    
    pedidos_atrasados = df_final[df_final['atraso_dias'] > 0]
    if not pedidos_atrasados.empty:
        print(f"\n⏳ Média de atraso em dias: {pedidos_atrasados['atraso_dias'].mean():.1f} dias")

if __name__ == '__main__':
    run_pipeline()