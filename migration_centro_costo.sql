-- Migración para cambiar CentroDeCosto de INTEGER a VARCHAR(20)
-- Ejecutar este script en tu base de datos MySQL

-- Paso 1: Crear una columna temporal
ALTER TABLE compras_reportadas_detalle 
ADD COLUMN CentroDeCosto_temp VARCHAR(20) NULL;

-- Paso 2: Copiar datos existentes (convertir INTEGER a STRING)
UPDATE compras_reportadas_detalle 
SET CentroDeCosto_temp = CAST(CentroDeCosto AS CHAR) 
WHERE CentroDeCosto IS NOT NULL;

-- Paso 3: Eliminar la columna original
ALTER TABLE compras_reportadas_detalle 
DROP COLUMN CentroDeCosto;

-- Paso 4: Renombrar la columna temporal
ALTER TABLE compras_reportadas_detalle 
CHANGE CentroDeCosto_temp CentroDeCosto VARCHAR(20) NULL;

-- Verificar que los datos se mantuvieron
SELECT COUNT(*) as total_registros, 
       COUNT(CentroDeCosto) as registros_con_centro_costo
FROM compras_reportadas_detalle; 