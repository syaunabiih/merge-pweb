
const fs = require('fs');
const path = require('path');

const { Item, Service } = require('../../models');


exports.edit = async (req, res) => {
  try {
    const allItems = await Item.findAll({
      order: [['name', 'ASC']]
    });
    const allServices = await Service.findAll({
      order: [['name', 'ASC']]
    });
    
    
    const combinedItems = [
      ...allItems.map(item => ({ ...item.toJSON(), type: 'item' })),
      ...allServices.map(service => ({ ...service.toJSON(), type: 'service' }))
    ];
    
    
    console.log('Sample items:', combinedItems.slice(0, 3).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      type: item.type
    })));
    
    
    res.render('admin/items/edit', { items: combinedItems, query: req.query });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
};


exports.getitemDetails = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { type } = req.query;
    
    let selecteditem;
    if (type === 'service') {
      selecteditem = await Service.findByPk(itemId);
    } else {
      selecteditem = await Item.findByPk(itemId);
    }
    
    if (!selecteditem) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    res.json(selecteditem);
  } catch (error) {
    console.error("Gagal mengambil detail item:", error);
    res.status(500).json({ message: 'Gagal mengambil detail item' });
  }
};


exports.updateitem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, category, description, status, price, quantity, type } = req.body;

    let itemToUpdate;
    let oldPhoto;
    
    if (type === 'service') {
      itemToUpdate = await Service.findByPk(itemId);
    } else {
      itemToUpdate = await Item.findByPk(itemId);
    }
    
    if (!itemToUpdate) {
      return res.status(404).send('Item yang akan diupdate tidak ditemukan.');
    }

    
    oldPhoto = itemToUpdate.photo;

   
    itemToUpdate.name = name;
    itemToUpdate.category = category;
    itemToUpdate.description = description;
    itemToUpdate.status = status;
    
    if (type === 'service') {
      itemToUpdate.price = parseFloat(price);
    } else {
      itemToUpdate.quantity = parseInt(quantity);
      itemToUpdate.price = null;
    }

    
    if (req.file) {
      itemToUpdate.photo = req.file.filename;
      
      if (oldPhoto) {
        const oldPhotoPath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', oldPhoto);
        try {
          fs.unlinkSync(oldPhotoPath);
          console.log(`Successfully deleted old image: ${oldPhotoPath}`);
        } catch (unlinkErr) {
          console.error(`Error deleting old image: ${unlinkErr.message}`);
        }
      }
    }

    await itemToUpdate.save();
   
    res.redirect('/admin/items?update=success');
  } catch (error) {
    console.error('Gagal mengupdate item:', error);
    res.status(500).send('Terjadi kesalahan saat menyimpan perubahan.');
  }
};