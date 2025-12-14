import React, { useState, useEffect } from 'react';

const brands = [
  { code: 'APPL', name: 'Apple' },
  { code: 'SAMS', name: 'Samsung' },
  { code: 'MSFT', name: 'Microsoft' },
  { code: 'DELL', name: 'Dell' },
  { code: 'LNVO', name: 'Lenovo' },
  { code: 'ASUS', name: 'Asus' },
  { code: 'HPXX', name: 'HP' },
  { code: 'ACERX', name: 'Acer' },
  { code: 'MSIX', name: 'MSI' },
  { code: 'HUAW', name: 'Huawei' },
  { code: 'GOOG', name: 'Google' },
];

const models = {
  APPL: [
    { code: 'IPH16P', name: 'iPhone 16 Pro' },
    { code: 'IPH16', name: 'iPhone 16' },
    { code: 'IPH15P', name: 'iPhone 15 Pro' },
    { code: 'IPH15', name: 'iPhone 15' },
    { code: 'IPH14P', name: 'iPhone 14 Pro' },
    { code: 'IPH14', name: 'iPhone 14' },
    { code: 'IPH13P', name: 'iPhone 13 Pro' },
    { code: 'IPH13', name: 'iPhone 13' },
    { code: 'IPDPR', name: 'iPad Pro' },
    { code: 'IPDAI', name: 'iPad Air' },
    { code: 'MBPM1', name: 'MacBook Pro M1' },
    { code: 'MBPM2', name: 'MacBook Pro M2' },
    { code: 'MBPM3', name: 'MacBook Pro M3' },
    { code: 'MBAM1', name: 'MacBook Air M1' },
    { code: 'MBAM2', name: 'MacBook Air M2' },
    { code: 'WTCHS', name: 'Apple Watch SE' },
    { code: 'WTCH9', name: 'Apple Watch S9' },
    { code: 'AIRPD', name: 'AirPods Pro' },
  ],
  SAMS: [
    { code: 'S24UL', name: 'Galaxy S24 Ultra' },
    { code: 'S24PL', name: 'Galaxy S24+' },
    { code: 'S24XX', name: 'Galaxy S24' },
    { code: 'S23UL', name: 'Galaxy S23 Ultra' },
    { code: 'S23PL', name: 'Galaxy S23+' },
    { code: 'ZFLD5', name: 'Galaxy Z Fold 5' },
    { code: 'ZFLP5', name: 'Galaxy Z Flip 5' },
    { code: 'TABS9', name: 'Galaxy Tab S9' },
    { code: 'BUDS', name: 'Galaxy Buds' },
  ],
  MSFT: [
    { code: 'SFPR9', name: 'Surface Pro 9' },
    { code: 'SFPR8', name: 'Surface Pro 8' },
    { code: 'SFLP5', name: 'Surface Laptop 5' },
    { code: 'SFLP4', name: 'Surface Laptop 4' },
    { code: 'SFGO3', name: 'Surface Go 3' },
  ],
  DELL: [
    { code: 'XPS13', name: 'XPS 13' },
    { code: 'XPS15', name: 'XPS 15' },
    { code: 'XPS17', name: 'XPS 17' },
    { code: 'INSP5', name: 'Inspiron 15' },
    { code: 'LATD5', name: 'Latitude 5000' },
    { code: 'ALIWR', name: 'Alienware' },
  ],
  LNVO: [
    { code: 'THKX1', name: 'ThinkPad X1' },
    { code: 'THKT4', name: 'ThinkPad T14' },
    { code: 'YOGAX', name: 'Yoga' },
    { code: 'LEGN5', name: 'Legion 5' },
    { code: 'IDPD5', name: 'IdeaPad 5' },
  ],
  ASUS: [
    { code: 'ROGZP', name: 'ROG Zephyrus' },
    { code: 'ROGST', name: 'ROG Strix' },
    { code: 'ZENBK', name: 'ZenBook' },
    { code: 'VIVBK', name: 'VivoBook' },
    { code: 'TUFGM', name: 'TUF Gaming' },
  ],
  HPXX: [
    { code: 'SPECX', name: 'Spectre x360' },
    { code: 'ENVYX', name: 'Envy' },
    { code: 'PAVLN', name: 'Pavilion' },
    { code: 'OMEN', name: 'OMEN' },
    { code: 'ELITB', name: 'EliteBook' },
  ],
  ACERX: [
    { code: 'SWFT3', name: 'Swift 3' },
    { code: 'ASPIR', name: 'Aspire' },
    { code: 'NITRO', name: 'Nitro 5' },
    { code: 'PREDH', name: 'Predator Helios' },
  ],
  MSIX: [
    { code: 'KATNA', name: 'Katana' },
    { code: 'STLTH', name: 'Stealth' },
    { code: 'RAIDR', name: 'Raider' },
    { code: 'CREAT', name: 'Creator' },
  ],
  HUAW: [
    { code: 'MTBKX', name: 'MateBook X' },
    { code: 'MTBK14', name: 'MateBook 14' },
    { code: 'P60PR', name: 'P60 Pro' },
    { code: 'MT60P', name: 'Mate 60 Pro' },
  ],
  GOOG: [
    { code: 'PXL9P', name: 'Pixel 9 Pro' },
    { code: 'PXL9', name: 'Pixel 9' },
    { code: 'PXL8P', name: 'Pixel 8 Pro' },
    { code: 'PXL8', name: 'Pixel 8' },
    { code: 'PXLTB', name: 'Pixel Tablet' },
  ],
};

const capacities = [
  { code: '064', name: '64GB' },
  { code: '128', name: '128GB' },
  { code: '256', name: '256GB' },
  { code: '512', name: '512GB' },
  { code: '01T', name: '1TB' },
  { code: '02T', name: '2TB' },
  { code: '08G', name: '8GB RAM' },
  { code: '16G', name: '16GB RAM' },
  { code: '32G', name: '32GB RAM' },
];

const conditions = [
  { code: 'NEW', name: 'Brand New' },
  { code: 'REFA', name: 'Refurbished Grade A' },
  { code: 'REFB', name: 'Refurbished Grade B' },
  { code: 'REFC', name: 'Refurbished Grade C' },
];

const colors = [
  { code: 'BLK', name: 'Black' },
  { code: 'WHT', name: 'White' },
  { code: 'SIL', name: 'Silver' },
  { code: 'GRA', name: 'Graphite' },
  { code: 'GLD', name: 'Gold' },
  { code: 'BLU', name: 'Blue' },
  { code: 'GRN', name: 'Green' },
  { code: 'PNK', name: 'Pink' },
  { code: 'PRP', name: 'Purple' },
  { code: 'RED', name: 'Red' },
  { code: 'NAT', name: 'Natural' },
  { code: 'TIT', name: 'Titanium' },
];

export default function SKUGenerator() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [condition, setCondition] = useState('');
  const [color, setColor] = useState('');
  const [sequence, setSequence] = useState('001');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const availableModels = brand ? (models[brand] || []) : [];

  useEffect(() => {
    setModel('');
  }, [brand]);

  const sku = brand && model && capacity && condition && color
    ? `${brand}-${model}-${capacity}-${condition}-${color}-${sequence}`
    : '';

  const copyToClipboard = () => {
    if (sku) {
      navigator.clipboard.writeText(sku);
      setCopied(true);
      setHistory(prev => [{ sku, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setBrand('');
    setModel('');
    setCapacity('');
    setCondition('');
    setColor('');
    setSequence(String(parseInt(sequence) + 1).padStart(3, '0'));
  };

  const SelectField = ({ label, value, onChange, options, disabled = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-3 border rounded-lg text-base ${
          disabled ? 'bg-gray-100 text-gray-400' : 'bg-white hover:border-blue-400'
        } ${value ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
      >
        <option value="">Select {label}...</option>
        {options.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.name} ({opt.code})</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Looptech SKU Generator</h1>
          <p className="text-gray-500 mb-6">Select options to generate a unique SKU code</p>

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Brand" value={brand} onChange={setBrand} options={brands} />
            <SelectField 
              label="Model" 
              value={model} 
              onChange={setModel} 
              options={availableModels}
              disabled={!brand}
            />
            <SelectField label="Capacity" value={capacity} onChange={setCapacity} options={capacities} />
            <SelectField label="Condition" value={condition} onChange={setCondition} options={conditions} />
            <SelectField label="Color" value={color} onChange={setColor} options={colors} />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sequence #</label>
              <input
                type="text"
                value={sequence}
                onChange={(e) => setSequence(e.target.value.replace(/\D/g, '').slice(0, 3).padStart(3, '0'))}
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                maxLength={3}
              />
            </div>
          </div>

          {/* SKU Output */}
          <div className={`mt-6 p-4 rounded-lg ${sku ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-100 border-2 border-dashed border-gray-300'}`}>
            <div className="text-sm text-gray-500 mb-1">Generated SKU:</div>
            <div className={`font-mono text-xl font-bold ${sku ? 'text-blue-700' : 'text-gray-400'}`}>
              {sku || 'BRAND-MODEL-CAP-COND-COLOR-###'}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={copyToClipboard}
              disabled={!sku}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                sku
                  ? copied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy SKU'}
            </button>
            <button
              onClick={reset}
              className="py-3 px-6 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
            >
              Reset & Next
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent SKUs</h2>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <code className="font-mono text-gray-700">{item.sku}</code>
                  <span className="text-gray-400">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Format Reference */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-sm font-medium text-amber-800 mb-2">SKU Format Reference:</div>
          <code className="text-xs text-amber-700">BRAND(4) - MODEL(5-6) - CAPACITY(3) - CONDITION(3-4) - COLOR(3) - SEQ(3)</code>
        </div>
      </div>
    </div>
  );
}
