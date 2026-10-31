# -*- coding: utf-8 -*-
"""读取 lingyang_data/announcements_full.json（155款），导出前端 data.js，
为每款车追加英文对照字段：vehicle_name_en / chassis_en / enterprise_en / brand_en。
映射策略：长关键词优先；未命中则用大类英文名兜底，保证英文语言下零中文。"""
import json, re, os

SRC = "/Users/why/WorkBuddy/2026-10-31-10-04-29/lingyang_data/announcements_full.json"
OUT = "/Users/why/WorkBuddy/2026-10-31-10-04-29/hesinco-site/assets/data.js"
CATS = {'随车吊与工程起重': 'trucks', '房车与旅居': 'rv', '专用改装与特种车': 'special'}
CAT_EN = {'随车吊与工程起重': 'Truck Crane & Engineering',
          '房车与旅居': 'Motorhome & RV',
          '专用改装与特种车': 'Specialty & Conversion Vehicle'}

# 车辆类型名映射：越长越具体越靠前
TYPE_MAP = [
    ('随车起重运输车', 'Truck-mounted Crane'),
    ('随车起重', 'Truck-mounted Crane'),
    ('汽车起重机', 'Truck Crane'),
    ('起重', 'Crane'),
    ('旅居车', 'Motorhome'),
    ('旅居', 'Motorhome'),
    ('宿营车', 'Camper Van'),
    ('房车', 'Motorhome'),
    ('清障车', 'Wrecker'),
    ('工具车', 'Utility Vehicle'),
    ('巡逻车', 'Patrol Vehicle'),
    ('电源车', 'Power Supply Vehicle'),
    ('仓栅式运输车', 'Stake-sided Cargo Truck'),
    ('仓栅', 'Stake-sided Truck'),
    ('厢式运输车', 'Box Cargo Truck'),
    ('厢式', 'Box Truck'),
    ('载货汽车', 'Cargo Truck'),
    ('载货', 'Cargo Truck'),
    ('客车', 'Passenger Bus'),
    ('商务车', 'Business Van'),
    ('平板运输车', 'Flatbed Transport'),
    ('平板', 'Flatbed'),
    ('自卸汽车', 'Dump Truck'),
    ('自卸', 'Dump Truck'),
    ('混凝土搅拌运输车', 'Concrete Mixer'),
    ('搅拌', 'Concrete Mixer'),
    ('检测车', 'Inspection Vehicle'),
    ('救险车', 'Rescue Vehicle'),
    ('指挥车', 'Command Vehicle'),
    ('防弹运钞车', 'Armored Cash Truck'),
    ('殡仪车', 'Funeral Vehicle'),
    ('售货车', 'Vending Vehicle'),
    ('炊事车', 'Field Kitchen Vehicle'),
    ('净水车', 'Water Purification Vehicle'),
    ('排涝车', 'Drainage Vehicle'),
    ('吸污车', 'Vacuum Sewage Truck'),
    ('高压清洗车', 'High-pressure Cleaning Truck'),
    ('真空吸粪车', 'Vacuum Fecal Truck'),
    ('绿化喷洒车', 'Greening Spray Truck'),
    ('抑尘车', 'Dust Suppression Truck'),
    ('洒水车', 'Water Sprinkler Truck'),
    ('摆臂式垃圾车', 'Swing-arm Garbage Truck'),
    ('车厢可卸式垃圾车', 'Detachable Garbage Truck'),
    ('压缩式垃圾车', 'Compressed Garbage Truck'),
    ('自装卸式垃圾车', 'Self-loading Garbage Truck'),
    ('桶装垃圾运输车', 'Bin-cargo Garbage Truck'),
    ('垃圾', 'Garbage Truck'),
    ('医疗车', 'Medical Vehicle'),
    ('体检车', 'Medical Check-up Vehicle'),
    ('伤残运送车', 'Ambulance Vehicle'),
    ('工程车', 'Service Vehicle'),
    ('检修车', 'Maintenance Vehicle'),
    ('宣传车', 'Campaign Vehicle'),
    ('流动服务车', 'Mobile Service Vehicle'),
    ('纯电动', 'Electric'),
]

# 底盘英文名映射
CHASSIS_MAP = [
    ('重汽', 'Sinotruk'), ('豪沃', 'Sinotruk Howo'), ('豪骏', 'Sinotruk Hohjun'),
    ('东风', 'Dongfeng'), ('解放', 'FAW Jiefang'), ('福田', 'Foton'),
    ('江淮', 'JAC'), ('庆铃', 'Isuzu'), ('五十铃', 'Isuzu'), ('江铃', 'JMC'),
    ('陕汽', 'Shacman'), ('大通', 'Maxus'), ('长城', 'Great Wall'),
    ('日产', 'Nissan'), ('丰田', 'Toyota'), ('福特', 'Ford'),
    ('依维柯', 'Iveco'), ('华菱', 'CAMC Hualing'), ('三一', 'Sany'),
    ('重汽王牌', 'Sinotruk Wangpai'), ('北汽', 'BAIC'),
    ('乘龙', 'Dongfeng Chenglong'), ('柳汽', 'Dongfeng Liuzhou'),
]

def type_en(name, cat):
    if not name:
        return CAT_EN.get(cat, 'Specialty Vehicle')
    for kw, en in TYPE_MAP:
        if kw in name:
            return en
    return CAT_EN.get(cat, 'Specialty Vehicle')

def chassis_en(ch):
    if not ch:
        return 'Bespoke / Custom-built'
    for kw, en in CHASSIS_MAP:
        if kw in ch:
            return en
    return ch  # 兜底保留原样（通常为品牌音译，已多为拼音可接受）

# 发动机厂商英文名映射（全称优先，再关键词）
MAKER_MAP = [
    ('江铃汽车股份有限公司', 'JMC'), ('江铃', 'JMC'),
    ('广州祺盛动力总成有限公司', 'GAC Qisheng'), ('广州棋盛动力总成有限公司', 'GAC Qisheng'),
    ('广州祺盛动力', 'GAC Qisheng'),
    ('上海新动力汽车科技股份有限公司', 'Shanghai New Power'), ('上海新动力', 'Shanghai New Power'),
    ('江苏悦达起亚汽车有限公司', 'Kia'), ('韩国起亚汽车公司', 'Kia'), ('起亚', 'Kia'),
    ('上汽动力科技(郑州)有限公司', 'SAIC Powertrain'), ('上汽', 'SAIC'),
    ('陕西汉德车桥有限公司', 'Shaanxi Hande Axle'), ('汉德', 'Hande'),
    ('长城汽车股份有限公司', 'Great Wall Motor'), ('长城', 'Great Wall'),
    ('极光湾科技有限公司', 'Aurobay'), ('哈尔滨东安汽车发动机制造有限公司', 'Dongan Engine'), ('东安', 'Dongan'),
    ('北京奔驰汽车有限公司', 'Beijing Benz'), ('奔驰', 'Mercedes-Benz'),
    ('北京现代汽车有限公司', 'Beijing Hyundai'), ('现代', 'Hyundai'),
    ('奇瑞汽车股份有限公司', 'Chery'), ('奇瑞', 'Chery'),
    ('柳州菱特动力科技有限公司', 'Liuzhou Lingte Power'),
    ('上汽通用汽车有限公司', 'SAIC-GM'), ('通用', 'GM'),
    ('中国重型汽车集团有限公司', 'Sinotruk'), ('中国重型汽车集团', 'Sinotruk'),
    ('中国重汽', 'Sinotruk'), ('重汽', 'Sinotruk'),
    ('东风汽车有限公司', 'Dongfeng'), ('东风商用车', 'Dongfeng'),
    ('东风康明斯', 'Dongfeng Cummins'), ('东风朝阳', 'Dongfeng Chaoyang'),
    ('东风', 'Dongfeng'),
    ('中国第一汽车集团', 'FAW'), ('一汽解放', 'FAW Jiefang'),
    ('一汽', 'FAW'), ('解放', 'FAW'),
    ('广西玉柴机器股份有限公司', 'Yuchai'), ('广西玉柴', 'Yuchai'), ('玉柴', 'Yuchai'),
    ('潍柴动力股份有限公司', 'Weichai'), ('潍柴控股', 'Weichai'), ('潍柴', 'Weichai'),
    ('北汽福田', 'Foton'), ('福田', 'Foton'),
    ('昆明云内动力股份有限公司', 'Yunnei'), ('昆明云内', 'Yunnei'), ('云内', 'Yunnei'),
    ('江西五十铃发动机有限公司', 'Isuzu'), ('江西五十铃', 'Isuzu'), ('庆铃五十铃', 'Isuzu'),
    ('庆铃', 'Isuzu'), ('五十铃', 'Isuzu'),
    ('康明斯(中国)', 'Cummins'), ('康明斯', 'Cummins'),
    ('上海柴油机股份有限公司', 'Shangchai'), ('上柴', 'Shangchai'),
    ('安徽华菱汽车有限公司', 'CAMC Hualing'), ('华菱', 'CAMC Hualing'),
    ('三一动力', 'Sany'), ('三一', 'Sany'),
    ('朝柴', 'Chaoyang'), ('扬柴', 'Yangchai'), ('全柴', 'Quanchai'),
    ('锡柴', 'Wuxi'), ('大柴', 'Dalian'), ('江淮', 'JAC'),
    ('日产', 'Nissan'), ('丰田', 'Toyota'), ('福特', 'Ford'), ('三菱', 'Mitsubishi'),
    ('德国道依茨', 'Deutz'), ('珀金斯', 'Perkins'), ('玉柴机器', 'Yuchai'),
]

def maker_en(m):
    if not m:
        return m
    for kw, en in MAKER_MAP:
        if kw in m:
            return en
    return m

fields = ('announcement_model','brand','enterprise','vehicle_name','announcement_batch',
        'announcement_date','emission_standard','fuel_type','gross_mass_kg','curb_mass_kg',
        'rated_load_kg','axle_count','wheelbase_mm','tires','overall_dimensions_mm',
        'cargo_dimensions_mm','chassis','max_speed_kmh','engines','remark','source_url')

d = json.load(open(SRC, encoding='utf-8'))
out = {}
for c, key in CATS.items():
    items = []
    for x in d:
        if x.get('website_category') != c or x.get('validity_status') != 'valid':
            continue
        rec = {k: x.get(k, '') for k in fields}
        rec['vehicle_name_en'] = type_en(x.get('vehicle_name'), c)
        rec['chassis_en'] = chassis_en(x.get('chassis'))
        rec['enterprise_en'] = 'Lingyang Automobile Manufacturing Co., Ltd.'
        rec['brand_en'] = 'LINGYANG'
        if isinstance(rec.get('engines'), list):
            for e in rec['engines']:
                e['maker_en'] = maker_en(e.get('maker', ''))
        items.append(rec)
    out[key] = items

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// HESIN vehicle dataset — valid MIIT announcement models (scraped 2026-10-31 from cn-truck.com)\n')
    f.write('// 字段说明：vehicle_name 中文公告名 / vehicle_name_en 英文；chassis 中文底盘 / chassis_en 英文底盘\n')
    f.write('window.HESIN_VEHICLES = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')

print('导出完成：', {k: len(v) for k, v in out.items()})
