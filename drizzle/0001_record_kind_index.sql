-- Additive migration: existing users, orders and product snapshots remain intact.
CREATE INDEX IF NOT EXISTS records_kind_idx ON records(kind);

UPDATE records SET data=json_insert(data,'$.categories[#]','Шляпные коробки') WHERE id='settings' AND NOT EXISTS (SELECT 1 FROM json_each(records.data,'$.categories') WHERE value='Шляпные коробки');

UPDATE records SET data=json_insert(data,'$.categories[#]','Корзины') WHERE id='settings' AND NOT EXISTS (SELECT 1 FROM json_each(records.data,'$.categories') WHERE value='Корзины');

UPDATE records SET data=json_insert(data,'$.categories[#]','Свадебные букеты') WHERE id='settings' AND NOT EXISTS (SELECT 1 FROM json_each(records.data,'$.categories') WHERE value='Свадебные букеты');
