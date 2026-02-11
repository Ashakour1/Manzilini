import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';
import cloudinary from '../config/cloudinary.js';



// get all properties for a user (admin/agent/regular creator)
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

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
            const allProperties = await prisma.property.findMany({
                include: {
                    images: true,
                    landlord: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            image: true
                        }
                    }
                }
            });
            return res.status(200).json(allProperties);
        } else if (user.role === 'AGENT') {
            // For agents, get properties from all users assigned to this agent
            const agentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { agentId: true }
            });

            if (!agentUser || !agentUser.agentId) {
                // Agent user doesn't have an agentId, return empty array
                return res.status(200).json([]);
            }

            // Find all users assigned to this agent
            const assignedUsers = await prisma.user.findMany({
                where: { agentId: agentUser.agentId },
                select: { id: true }
            });

            const assignedUserIds = assignedUsers.map(u => u.id);

            // Get properties created by users assigned to this agent
            const properties = await prisma.property.findMany({
                where: {
                    userId: { in: assignedUserIds }
                },
                include: {
                    images: true,
                    landlord: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            image: true,
                            agentId: true,
                            agent: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { is_featured: 'desc' },
                    { createdAt: 'desc' }
                ]
            });
            return res.status(200).json(properties);
        } else {
            // For regular users, return only their own properties
            const properties = await prisma.property.findMany({
                where: { userId },
                include: {
                    images: true,
                    landlord: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            image: true
                        }
                    }
                }
            });
            return res.status(200).json(properties);
        }

    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// get all properties for the logged-in landlord (by landlord_id)
export const getPropertiesForLandlord = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        // Get the logged in user (should have role LANDLORD)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'LANDLORD') {
            return res.status(403).json({ message: 'Access denied. Landlord role required.' });
        }

        // Find landlord record linked by email (same email used when registering landlord with user)
        const landlord = await prisma.landlord.findUnique({
            where: { email: user.email },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        if (!landlord) {
            return res.status(404).json({ message: 'Landlord profile not found for this user' });
        }

        // Fetch properties that belong to this landlord
        const properties = await prisma.property.findMany({
            where: { landlord_id: landlord.id },
            include: {
                images: true,
                landlord: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        image: true,
                    }
                }
            },
            orderBy: [
                { is_featured: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return res.status(200).json(properties);
    } catch (error) {
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
            landlord: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    image: true
                }
            }
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
                landlord: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        image: true
                    }
                }
            }
        });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export const createProperty = asyncHandler(async (req, res) => {
    try {
        const { title, description, property_type, status, price, currency, payment_frequency, deposit_amount, deposit_type, country, city, address, zip_code, latitude, longitude, bedrooms, bathrooms, garages, size, is_furnished, floor, total_floors, balcony, amenities, is_featured, landlord_id, is_published } = req.body || {};

        if (!title || !description || !property_type || !status || !price || !currency || !payment_frequency || !deposit_amount || !country || !city || !address || !zip_code || !latitude || !longitude || !bedrooms || !bathrooms || !garages || !size || !is_furnished || !floor || !total_floors || !balcony || !amenities) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Get the authenticated user ID (creator)
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User authentication required' });
        }

        // Validate that user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set is_published: false for agents, otherwise use provided value or default to true
        let publishedValue = is_published !== undefined ? (is_published === 'true' || is_published === true) : true;
        if (user.role === 'AGENT') {
            publishedValue = false;
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

        // Upload property images to Cloudinary (memory upload -> buffer)
        const imageUrls = [];
        if (Array.isArray(req.files) && req.files.length > 0) {
            for (const file of req.files) {
                const mimeType = file.mimetype || 'image/jpeg';
                const encodedImage = `data:${mimeType};base64,${file.buffer.toString("base64")}`;

                const result = await cloudinary.uploader.upload(encodedImage, {
                    resource_type: "image",
                    quality: "auto:best",
                    fetch_format: "auto",
                    folder: "properties",
                });

                if (result && result.secure_url) {
                    imageUrls.push(result.secure_url);
                }
            }
        }
        // Handle deposit_amount - if it's a string with %, extract the number
        let parsedDepositAmount = null;
        if (deposit_amount !== undefined && deposit_amount !== null && deposit_amount !== '') {
            if (typeof deposit_amount === 'string' && deposit_amount.includes('%')) {
                parsedDepositAmount = parseFloat(deposit_amount.replace('%', ''));
            } else {
                parsedDepositAmount = parseFloat(deposit_amount);
            }
        }

        const propertyData = {
            title,
            description,
            property_type,
            status,
            price : parseFloat(price),
            currency,
            payment_frequency,
            deposit_amount: parsedDepositAmount,
            deposit_type: deposit_type || 'FIXED',
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
            is_published: publishedValue,
        };

        // Only include landlord_id if provided
        if (landlord_id) {
            propertyData.landlord_id = landlord_id;
        }

        // Set the creator userId
        propertyData.userId = userId;

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
                    landlord: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            image: true
                        }
                    }
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
        const { title, description, property_type, status, price, currency, payment_frequency, deposit_amount, deposit_type, country, city, address, zip_code, latitude, longitude, bedrooms, bathrooms, garages, size, is_furnished, floor, total_floors, balcony, amenities, is_featured, landlord_id, is_published } = req.body || {};

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
        if (deposit_amount !== undefined) {
            // Handle deposit_amount - if it's a string with %, extract the number
            if (typeof deposit_amount === 'string' && deposit_amount.includes('%')) {
                updateData.deposit_amount = parseFloat(deposit_amount.replace('%', ''));
            } else {
                updateData.deposit_amount = parseFloat(deposit_amount);
            }
        }
        if (deposit_type !== undefined) updateData.deposit_type = deposit_type;
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
        if (is_published !== undefined) updateData.is_published = is_published === 'true' || is_published === true;
        if (landlord_id !== undefined) {
            // Allow null or empty string to remove landlord association
            updateData.landlord_id = (landlord_id === '' || landlord_id === null) ? null : landlord_id;
        }

        // If new images are uploaded, push them to Cloudinary and append as PropertyImages
        const newImageUrls = [];
        if (Array.isArray(req.files) && req.files.length > 0) {
            for (const file of req.files) {
                const mimeType = file.mimetype || 'image/jpeg';
                const encodedImage = `data:${mimeType};base64,${file.buffer.toString("base64")}`;

                const result = await cloudinary.uploader.upload(encodedImage, {
                    resource_type: "image",
                    quality: "auto:best",
                    fetch_format: "auto",
                    folder: "properties",
                });

                if (result && result.secure_url) {
                    newImageUrls.push(result.secure_url);
                }
            }
        }

        if (newImageUrls.length) {
            updateData.images = {
                create: newImageUrls.map((url) => ({ url })),
            };
        }

        const property = await prisma.property.update({
            where: { id },
            data: updateData,
            include: {
                images: true,
                landlord: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        image: true
                    }
                }
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
            include: { images: true }
        });

        if (!existingProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Delete images from Cloudinary first
        if (existingProperty.images && existingProperty.images.length > 0) {
            for (const image of existingProperty.images) {
                try {
                    // Extract public_id from Cloudinary URL
                    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
                    // or: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{format}
                    const urlParts = image.url.split('/');
                    const uploadIndex = urlParts.findIndex(part => part === 'upload');
                    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
                        // Get the path after 'upload' (skip version if present)
                        let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
                        // Remove file extension
                        const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
                        
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (cloudinaryError) {
                    console.error('Error deleting image from Cloudinary:', cloudinaryError);
                    // Continue even if Cloudinary deletion fails
                }
            }
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

// Delete a single property image
export const deletePropertyImage = asyncHandler(async (req, res) => {
    try {
        const { id, imageId } = req.params;
        
        // Check if property exists
        const property = await prisma.property.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Find the image to delete
        const imageToDelete = property.images.find(img => img.id === imageId);
        
        if (!imageToDelete) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete image from Cloudinary
        try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
            // or: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{format}
            const urlParts = imageToDelete.url.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
                // Get the path after 'upload' (skip version if present)
                let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
                // Remove file extension
                const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
                
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (cloudinaryError) {
            console.error('Error deleting image from Cloudinary:', cloudinaryError);
            // Continue with database deletion even if Cloudinary deletion fails
        }

        // Delete image from database
        await prisma.propertyImages.delete({
            where: { id: imageId }
        });

        res.status(200).json({ message: 'Image deleted successfully', imageId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
