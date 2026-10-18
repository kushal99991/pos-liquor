import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Scan as Scanner, Printer, CreditCard, DollarSign, Wifi, Bluetooth, Usb, Settings, Plus, Trash2, CheckCircle, XCircle, RotateCw } from 'lucide-react';
import { addDevice, removeDevice, updateDevice, setAvailableDevices } from 'store/slice/pos.slice';

const DeviceConfigStep = () => {
  const dispatch = useDispatch();
  const { devices, availableDevices } = useSelector((state) => state.pos);
  const [scanning, setScanning] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'scanner',
    model: '',
    serialNumber: '',
    ipAddress: '',
    connectionType: 'usb',
    settings: {}
  });

  const deviceTypes = [
    { value: 'scanner', label: 'Barcode Scanner', icon: Scanner, color: 'blue' },
    { value: 'printer', label: 'Receipt Printer', icon: Printer, color: 'green' },
    { value: 'payment_terminal', label: 'Payment Terminal', icon: CreditCard, color: 'purple' },
    { value: 'cash_drawer', label: 'Cash Drawer', icon: DollarSign, color: 'orange' }
  ];

  const connectionTypes = [
    { value: 'usb', label: 'USB', icon: Usb },
    { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { value: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
    { value: 'ethernet', label: 'Ethernet', icon: Wifi }
  ];

  const scanForDevices = async () => {
    setScanning(true);
    
    // Simulate device scanning
    setTimeout(() => {
      const mockDevices = [
        {
          id: 'scanner-001',
          name: 'Honeywell Voyager 1400g',
          type: 'scanner',
          status: 'disconnected',
          model: '1400g',
          serialNumber: 'HW001234',
          connectionType: 'usb',
          settings: { sensitivity: 'high', beep: true }
        },
        {
          id: 'printer-001',
          name: 'Epson TM-T88VI',
          type: 'printer',
          status: 'disconnected',
          model: 'TM-T88VI',
          serialNumber: 'EP567890',
          ipAddress: '192.168.1.100',
          connectionType: 'ethernet',
          settings: { paperWidth: '80mm', cutType: 'partial' }
        },
        {
          id: 'terminal-001',
          name: 'Stripe Terminal S700',
          type: 'payment_terminal',
          status: 'disconnected',
          model: 'S700',
          serialNumber: 'ST098765',
          connectionType: 'wifi',
          settings: { location: 'store-front', currency: 'USD' }
        }
      ];
      
      dispatch(setAvailableDevices(mockDevices));
      setScanning(false);
    }, 3000);
  };

  const connectDevice = async (deviceId) => {
    const device = availableDevices.find(d => d.id === deviceId);
    if (device) {
      const connectedDevice = { ...device, status: 'connected' };
      dispatch(updateDevice(connectedDevice));
      dispatch(addDevice(connectedDevice));
    }
  };

  const disconnectDevice = (deviceId) => {
    const device = devices?.find(d => d.id === deviceId);
    if (device) {
      dispatch(updateDevice({ ...device, status: 'disconnected' }));
      dispatch(removeDevice(deviceId));
    }
  };

  const addManualDevice = () => {
    if (newDevice.name && newDevice.type) {
      const device = {
        id: `${newDevice.type}-${Date.now()}`,
        name: newDevice.name,
        type: newDevice.type,
        status: 'disconnected',
        model: newDevice.model || 'Unknown',
        serialNumber: newDevice.serialNumber,
        ipAddress: newDevice.ipAddress,
        connectionType: newDevice.connectionType,
        settings: newDevice.settings || {}
      };
      
      dispatch(addDevice(device));
      setNewDevice({
        name: '',
        type: 'scanner',
        model: '',
        serialNumber: '',
        ipAddress: '',
        connectionType: 'usb',
        settings: {}
      });
      setShowAddDevice(false);
    }
  };

  const getDeviceIcon = (type) => {
    const deviceType = deviceTypes.find(dt => dt.value === type);
    return deviceType?.icon || Scanner;
  };

  const getDeviceColor = (type) => {
    const deviceType = deviceTypes.find(dt => dt.value === type);
    return deviceType?.color || 'gray';
  };

  const getConnectionIcon = (type) => {
    const connectionType = connectionTypes.find(ct => ct.value === type);
    return connectionType?.icon || Usb;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings size={32} className="text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Configuration</h2>
        <p className="text-gray-600">Set up your hardware devices for a complete POS experience</p>
      </div>

      {/* Device Scanner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Devices</h3>
          <button
            onClick={scanForDevices}
            disabled={scanning}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {scanning ? (
              <RotateCw size={16} className="mr-2 animate-spin" />
            ) : (
              <Scanner size={16} className="mr-2" />
            )}
            {scanning ? 'Scanning...' : 'Scan for Devices'}
          </button>
        </div>

        {scanning && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Scanning for nearby devices...</p>
          </div>
        )}

        {!scanning && availableDevices?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No devices found. Make sure your devices are powered on and connected.</p>
            <button
              onClick={() => setShowAddDevice(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add device manually
            </button>
          </div>
        )}

        {!scanning && availableDevices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDevices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.type);
              const ConnectionIcon = getConnectionIcon(device.connectionType);
              const isConnected = devices?.some(d => d.id === device.id);
              const colorClass = getDeviceColor(device.type);
              
              return (
                <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 bg-${colorClass}-100 rounded-full flex items-center justify-center mr-3`}>
                        <DeviceIcon size={20} className={`text-${colorClass}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{device.name}</h4>
                        <p className="text-sm text-gray-500">{device.model}</p>
                      </div>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isConnected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isConnected ? (
                        <CheckCircle size={12} className="mr-1" />
                      ) : (
                        <XCircle size={12} className="mr-1" />
                      )}
                      {isConnected ? 'Connected' : 'Available'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <ConnectionIcon size={14} className="mr-1" />
                      {connectionTypes.find(ct => ct.value === device.connectionType)?.label}
                    </div>
                    {device.serialNumber && (
                      <span className="text-xs">SN: {device.serialNumber}</span>
                    )}
                  </div>

                  <button
                    onClick={() => isConnected ? disconnectDevice(device.id) : connectDevice(device.id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      isConnected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connected Devices */}
      {devices?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Devices</h3>
          <div className="space-y-4">
            {devices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.type);
              const ConnectionIcon = getConnectionIcon(device.connectionType);
              const colorClass = getDeviceColor(device.type);
              
              return (
                <div key={device.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 bg-${colorClass}-100 rounded-full flex items-center justify-center mr-4`}>
                      <DeviceIcon size={20} className={`text-${colorClass}-600`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{device.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <ConnectionIcon size={14} className="mr-1" />
                        {connectionTypes.find(ct => ct.value === device.connectionType)?.label}
                        {device.ipAddress && ` • ${device.ipAddress}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <CheckCircle size={12} className="mr-1" />
                      Ready
                    </div>
                    <button
                      onClick={() => disconnectDevice(device.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Device Manually */}
      <div className="text-center">
        <button
          onClick={() => setShowAddDevice(true)}
          className="flex items-center mx-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Device Manually
        </button>
      </div>

      {/* Manual Device Form Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Device Manually</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter device name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                <select
                  value={newDevice.type}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {deviceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Device model"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
                <select
                  value={newDevice.connectionType}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, connectionType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {connectionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {(newDevice.connectionType === 'wifi' || newDevice.connectionType === 'ethernet') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={newDevice.ipAddress}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, ipAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="192.168.1.100"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddDevice(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addManualDevice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceConfigStep;