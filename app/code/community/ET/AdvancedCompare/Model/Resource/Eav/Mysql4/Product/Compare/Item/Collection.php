<?php
/**
 * NOTICE OF LICENSE
 *
 * You may not sell, sub-license, rent or lease
 * any portion of the Software or Documentation to anyone.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade to newer
 * versions in the future.
 *
 * @category   ET
 * @package    ET_AdvancedCompare
 * @copyright  Copyright (c) 2012 ET Web Solutions (http://etwebsolutions.com)
 * @contacts   support@etwebsolutions.com
 * @license    http://shop.etwebsolutions.com/etws-license-free-v1/   ETWS Free License (EFL1)
 */

// for attribute sorting in compare window

class ET_AdvancedCompare_Model_Resource_Eav_Mysql4_Product_Compare_Item_Collection
    extends Mage_Catalog_Model_Resource_Eav_Mysql4_Product_Compare_Item_Collection
{

    public function getComparableAttributes()
    {
        /* 1.3.2.3, 1.3.2.4, 1.4.0.0, 1.4.0.1, 1.4.1.1, 1.4.2.0, 1.5.0.1
        // проблема с сортировкой точно существовала до версии 1411,
        // дальше надо проверять.
        // так как функция менялась в разных версиях, то для 13х и
        // для 14х надо разные функции.
        */

        $sortattributes = Mage::getStoreConfig('advancedcompare/popup/sortattributes');
        if ($sortattributes) {
            $version = substr(Mage::getVersion(), 0, 3);
        } else {
            $version = 'disabled';
        }

        switch ($version) {
            case '1.3':
                $returnValue = $this->getComparableAttributes13x();
                break;

            case '1.4':
            case '1.5':
            case '1.6':
            case '1.7':
            case '1.8':
            case '1.9':
                $returnValue = $this->getComparableAttributes14x();
                break;

            default:
                $returnValue = parent::getComparableAttributes();
        }
        return $returnValue;
    }

    public function getComparableAttributes13x()
    {
        if (is_null($this->_comparableAttributes)) {
            $setIds = $this->_getAttributeSetIds();
            if ($setIds) {
                //$attributeIds = $this->_getAttributeIdsBySetIds($setIds);

                $select = $this->getConnection()->select()
                    ->from(array('t1' => $this->getTable('eav/attribute')))
                    ->where('t1.is_comparable=?', 1)
                    ->joinLeft(array(
                        't2' => $this->getTable('eav/entity_attribute')),
                        't2.attribute_id=t1.attribute_id'
                    )
                    //->where('t1.attribute_id IN(?)', $attributeIds);
                    ->where('t2.attribute_set_id IN(?)', $setIds)
                    ->order(array('t2.attribute_group_id ASC', 't2.sort_order ASC'));

                $attributesData = $this->getConnection()->fetchAll($select);

                if ($attributesData) {
                    $entityType = 'catalog_product';
                    Mage::getSingleton('eav/config')
                        ->importAttributesData($entityType, $attributesData);
                    foreach ($attributesData as $data) {
                        $attribute = Mage::getSingleton('eav/config')
                            ->getAttribute($entityType, $data['attribute_code']);
                        $this->_comparableAttributes[$attribute->getAttributeCode()] = $attribute;
                    }
                    unset($attributesData);
                }
            } else {
                $this->_comparableAttributes = array();
            }
        }
        return $this->_comparableAttributes;
    }


    public function getComparableAttributes14x()
    {
        if (is_null($this->_comparableAttributes)) {
            $this->_comparableAttributes = array();
            $setIds = $this->_getAttributeSetIds();
            if ($setIds) {
                $attributeIds = $this->_getAttributeIdsBySetIds($setIds);


                $select = $this->getConnection()->select()
                    ->from(array('main_table' => $this->getTable('eav/attribute')))
                    ->join(
                        array('additional_table' => $this->getTable('catalog/eav_attribute')),
                        'additional_table.attribute_id=main_table.attribute_id'
                    )
                    ->joinLeft(
                        array('al' => $this->getTable('eav/attribute_label')),
                        'al.attribute_id = main_table.attribute_id AND al.store_id = ' . (int) $this->getStoreId(),
                        array('store_label' => new Zend_Db_Expr('IFNULL(al.value, main_table.frontend_label)'))
                    )
                    ->joinLeft(
                        array('ai' => $this->getTable('eav/entity_attribute')),
                        'ai.attribute_id = main_table.attribute_id'
                    )


                    ->joinLeft(
                        array('eea' => $this->getTable('eav/entity_attribute')),
                        'main_table.attribute_id = eea.attribute_id',
                        array('eea_sort_order' => 'eea.sort_order')

                    )

                    ->joinLeft(
                        array('eag' => $this->getTable('eav/attribute_group')),
                        'eag.attribute_set_id = eea.attribute_set_id
                            and eag.attribute_group_id = eea.attribute_group_id',
                        array('eag_sort_order' => 'eag.sort_order')
                    )


                    ->where('additional_table.is_comparable=?', 1)
                    ->where("eag.attribute_set_id in (?)", $setIds)
                    ->where("ai.attribute_set_id in (?)", $setIds)
                    ->where('main_table.attribute_id IN(?)', $attributeIds)
                    ->order(array(
                        'eag_sort_order ASC',
                        //'ai.attribute_group_id ASC',
                        'ai.sort_order ASC')
                    );

                $attributesData = $this->getConnection()->fetchAll($select);
                if ($attributesData) {
                    $entityType = 'catalog_product';
                    Mage::getSingleton('eav/config')
                        ->importAttributesData($entityType, $attributesData);
                    foreach ($attributesData as $data) {
                        $attribute = Mage::getSingleton('eav/config')
                            ->getAttribute($entityType, $data['attribute_code']);
                        $this->_comparableAttributes[$attribute->getAttributeCode()] = $attribute;
                    }
                    unset($attributesData);
                }
            }
        }
        return $this->_comparableAttributes;
    }

}
