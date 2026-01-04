import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';



// get all properties for a user
export const getPropertiesForUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
            const allProperties = await prisma.property.findMany({
                include: {
                    images: true,
                    landlord: true
                }
            });
            return res.status(200).json(allProperties);
        }else{
            const properties = await prisma.property.findMany({
                where: { userId },
            });
            return res.status(200).json(properties);
        }

    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// get all properties
export const getProperties = asyncHandler(async (req, res) => {

    

    const { city,property_type  } = req.query;

    
    const whereClause = {
        city: city || undefined,
        property_type: property_type || undefined,
    }





    const properties = await prisma.property.findMany({
        where: whereClause,
        orderBy: [
            { is_featured: 'desc' },
            { createdAt: 'desc' }
        ],
        include: {
            images: true,
            landlord: true
        }
    });


    return res.status(200).json(properties);


    
  
});


export const getPropertyTypes = asyncHandler(async (req, res) => {
    try {
        // Group properties by type and count them
        const propertyTypes = await prisma.property.groupBy({
            by: ['property_type'],
            _count: {
                property_type: true
            }
        });

        // Transform the result to include type and count
        const result = propertyTypes.map(item => ({
            type: item.property_type,
            count: item._count.property_type
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export const getPropertyCountsByCity = asyncHandler(async (req, res) => {
    try {
        // Group properties by city and count them
        const cityCounts = await prisma.property.groupBy({
            by: ['city'],
            _count: {
                city: true
            }
        });

        // Transform the result to include city and count
        const result = cityCounts.map(item => ({
            city: item.city,
            count: item._count.city
        }));

        res.status(200).json(result);
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
                images: true,
                landlord: true
            }
        });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export const createProperty = asyncHandler(async (req, res) => {
    try {
        const { title, description, property_type, status, price, currency, payment_frequency, deposit_amount, country, city, address, zip_code, latitude, longitude, bedrooms, bathrooms, garages, size, is_furnished, floor, total_floors, balcony, amenities, is_featured, landlord_id } = req.body || {};

        if (!title || !description || !property_type || !status || !price || !currency || !payment_frequency || !deposit_amount || !country || !city || !address || !zip_code || !latitude || !longitude || !bedrooms || !bathrooms || !garages || !size || !is_furnished || !floor || !total_floors || !balcony || !amenities) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Validate that landlord exists if landlord_id is provided
        if (landlord_id) {
            const landlord = await prisma.landlord.findUnique({
                where: { id: landlord_id }
            });

            if (!landlord) {
                return res.status(400).json({ message: 'Landlord not found' });
            }
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
            is_featured : is_featured === 'true' || is_featured === true,
        };

        // Only include landlord_id if provided
        if (landlord_id) {
            propertyData.landlord_id = landlord_id;
        }

        if (imageUrls.length) {
            propertyData.images = {
                create: imageUrls.map((url) => ({ url })),
            };
        }

        // Generate unique ID and create property in a single transaction
        // This ensures counter only increments on successful creation
        const property = await generateUniqueIdAndCreate('Property', async (tx, uniqueId) => {
            return await tx.property.create({
                data: {
                    ...propertyData,
                    id: uniqueId,
                },
                include: { 
                    images: true,
                    landlord: true
                },
            });
        });


        
        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export const updateProperty = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, property_type, status, price, currency, payment_frequency, deposit_amount, country, city, address, zip_code, latitude, longitude, bedrooms, bathrooms, garages, size, is_furnished, floor, total_floors, balcony, amenities, is_featured, landlord_id } = req.body || {};

        // Get current property to check existing landlord
        const currentProperty = await prisma.property.findUnique({
            where: { id },
            include: { landlord: true }
        });

        if (!currentProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // If landlord_id is being updated and provided, validate that landlord exists
        if (landlord_id !== undefined && landlord_id !== null && landlord_id !== '') {
            const landlord = await prisma.landlord.findUnique({
                where: { id: landlord_id }
            });

            if (!landlord) {
                return res.status(400).json({ message: 'Landlord not found' });
            }
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (property_type !== undefined) updateData.property_type = property_type;
        if (status !== undefined) updateData.status = status;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (currency !== undefined) updateData.currency = currency;
        if (payment_frequency !== undefined) updateData.payment_frequency = payment_frequency;
        if (deposit_amount !== undefined) updateData.deposit_amount = parseFloat(deposit_amount);
        if (country !== undefined) updateData.country = country;
        if (city !== undefined) updateData.city = city;
        if (address !== undefined) updateData.address = address;
        if (zip_code !== undefined) updateData.zip_code = zip_code;
        if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
        if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
        if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms, 10);
        if (bathrooms !== undefined) updateData.bathrooms = parseInt(bathrooms, 10);
        if (garages !== undefined) updateData.garages = parseInt(garages, 10);
        if (size !== undefined) updateData.size = parseFloat(size);
        if (is_furnished !== undefined) updateData.is_furnished = is_furnished === 'true' || is_furnished === true;
        if (floor !== undefined) updateData.floor = parseInt(floor, 10);
        if (total_floors !== undefined) updateData.total_floors = parseInt(total_floors, 10);
        if (balcony !== undefined) updateData.balcony = balcony === 'true' || balcony === true;
        if (amenities !== undefined) updateData.amenities = Array.isArray(amenities) ? amenities : JSON.parse(amenities);
        if (is_featured !== undefined) updateData.is_featured = is_featured === 'true' || is_featured === true;
        if (landlord_id !== undefined) {
            // Allow null or empty string to remove landlord association
            updateData.landlord_id = (landlord_id === '' || landlord_id === null) ? null : landlord_id;
        }

        const property = await prisma.property.update({
            where: { id },
            data: updateData,
            include: {
                landlord: true
            }
        });

        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export const deleteProperty = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if property exists
        const existingProperty = await prisma.property.findUnique({
            where: { id },
        });

        if (!existingProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Delete related records first (in case cascade doesn't work immediately after migration)
        // Using a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Delete payments associated with this property
            await tx.payment.deleteMany({
                where: { propertyId: id },
            });

            // Delete property applications
            await tx.propertyApplication.deleteMany({
                where: { propertyId: id },
            });

            // Delete property images
            await tx.propertyImages.deleteMany({
                where: { propertyId: id },
            });

            // Finally, delete the property
            await tx.property.delete({
                where: { id },
            });
        });

        res.status(200).json({ message: 'Property deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
