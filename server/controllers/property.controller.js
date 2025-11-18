import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';


export const getProperties = asyncHandler(async (req, res) => {
    try {
        const properties = await prisma.property.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include : {
                images: true
            }
        });
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export const getPropertyById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const property = await prisma.property.findUnique({
            where: { id },
            include : {
                images: true
            }
        });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export const createProperty = asyncHandler(async (req, res) => {
    // title String
    // description String
    // property_type propertyType @default(APARTMENT)
    // status Status @default(FOR_RENT)
    // price Float
    // currency Currency @default(USD)
    // payment_frequency PaymentFrequency @default(MONTHLY)
    // deposit_amount Float?
  
    // // location
    // country String
    // city String
    // address String
    // zip_code String
    // latitude Float
    // longitude Float
  
    // // property feature
    // bedrooms Int?
    // bathrooms Int?
    // garages Int?
    // size Float?
    // is_furnished Boolean? @default(false)
    // floor Int?
    // total_floors Int?
    // balcony Boolean? @default(false)
    // amenities String[]
  
  
    // //  media
  
  
    // // relations
    // landlord User @relation(fields: [landlord_id], references: [id])
    // landlord_id String
    // contact_name String?
    // contact_email String?
    // contact_phone String?
    // contact_method ContactMethod @default(EMAIL)
    try {
        const { title, description, property_type, status, price, currency, payment_frequency, deposit_amount, country, city, address, zip_code, latitude, longitude, bedrooms, bathrooms, garages, size, is_furnished, floor, total_floors, balcony, amenities, landlord_id, contact_name, contact_email, contact_phone, contact_method } = req.body || {};

        if (!title || !description || !property_type || !status || !price || !currency || !payment_frequency || !deposit_amount || !country || !city || !address || !zip_code || !latitude || !longitude || !bedrooms || !bathrooms || !garages || !size || !is_furnished || !floor || !total_floors || !balcony || !amenities || !landlord_id || !contact_name || !contact_email || !contact_phone || !contact_method) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Convert uploaded files to publicly accessible URLs served by this API
        const imageBaseUrl = `${req.protocol}://${req.get("host")}/uploads`;
        const imageUrls = (req.files || []).map((file) => {
            const filename = file.filename || file.originalname;
            return `${imageBaseUrl}/${filename}`;
        });
        const propertyData = {
            title,
            description,
            property_type,
            status,
            price : parseFloat(price),
            currency,
            payment_frequency,
            deposit_amount : parseFloat(deposit_amount),
            country,
            city,
            address,
            zip_code,
            latitude : parseFloat(latitude),
            longitude : parseFloat(longitude),
            bedrooms : parseInt(bedrooms, 10),
            bathrooms : parseInt(bathrooms, 10),
            garages : parseInt(garages, 10),
            size : parseFloat(size),
            is_furnished : is_furnished === 'true' || is_furnished === true,
            floor : parseInt(floor, 10),
            total_floors : parseInt(total_floors, 10),
            balcony : balcony === 'true' || balcony === true,
            amenities: Array.isArray(amenities) ? amenities : JSON.parse(amenities),
            landlord_id,
            contact_name,
            contact_email,
            contact_phone,
            contact_method,
        };

        if (imageUrls.length) {
            propertyData.images = {
                create: imageUrls.map((url) => ({ url })),
            };
        }

        const property = await prisma.property.create({
            data: propertyData,
            include: { images: true },
        });


        
        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export const updateProperty = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, property_type, status, price, currency, payment_frequency, deposit_amount, country, city, address, zip_code, latitude, longitude, bedrooms, bathrooms, garages, size, is_furnished, floor, total_floors, balcony, amenities, landlord_id, contact_name, contact_email, contact_phone, contact_method } = req.body || {};

        // if (!title || !description || !property_type || !status || !price || !currency || !payment_frequency || !deposit_amount || !country || !city || !address || !zip_code || !latitude || !longitude || !bedrooms || !bathrooms || !garages || !size || !is_furnished || !floor || !total_floors || !balcony || !amenities || !landlord_id || !contact_name || !contact_email || !contact_phone || !contact_method) {
        //     return res.status(400).json({ message: 'All fields are required' });
        // }

        const property = await prisma.property.update({
            where: { id },
            data: { title, description, property_type, status, price, currency, payment_frequency, deposit_amount, country, city, address, zip_code, latitude, longitude, bedrooms, bathrooms, garages, size, is_furnished, floor, total_floors, balcony, amenities, landlord_id, contact_name, contact_email, contact_phone, contact_method },
        });

        if (!property) {
            return res.status(400).json({ message: 'Property not found' });
        }

        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export const deleteProperty = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const property = await prisma.property.delete({
            where: { id },
        });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
