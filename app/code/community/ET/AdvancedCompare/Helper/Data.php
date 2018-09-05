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

class ET_AdvancedCompare_Helper_Data extends Mage_Catalog_Helper_Product_Compare
{
    /**
     * Retrieve url for adding product to conpare list
     *
     * @param   Mage_Catalog_Model_Product $product
     * @return  string
     */
    public function getAddUrl($product)
    {
        $config = Mage::getStoreConfig('advancedcompare/general');
        if (
            ($config['removecompare'])
            || (($config['removelink']) && ((bool)($product->getData('remove_compare_link'))))
        ) {
            return false;
        } else {
            return parent::getAddUrl($product);
        }
    }
}
