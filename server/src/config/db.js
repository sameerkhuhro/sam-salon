import mongoose from 'mongoose'

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI
  const isAtlas = primaryUri && (primaryUri.includes('mongodb+srv://') || primaryUri.includes('.mongodb.net'))
  const hasPlaceholder = primaryUri && primaryUri.includes('<') && primaryUri.includes('>')

  // If URI has placeholder like <db_password>, inform the developer clearly
  if (hasPlaceholder) {
    console.warn('\n====================================================================')
    console.warn('[MongoDB Atlas Notice] MONGODB_URI contains unreplaced placeholder <db_password>.')
    console.warn('To connect to your live MongoDB Atlas cloud cluster:')
    console.warn('  1. Open server/.env')
    console.warn('  2. Replace <db_password> with your MongoDB database user password.')
    console.warn('  3. Ensure database name is set: ...mongodb.net/salonhub?retryWrites=true&w=majority')
    console.warn('Falling back to local MongoDB (mongodb://127.0.0.1:27017/salonhub) for now...')
    console.warn('====================================================================\n')
  }

  // Attempt primary Atlas connection if configured
  if (primaryUri && !hasPlaceholder) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        dbName: 'salonhub',
        serverSelectionTimeoutMS: 10000,
      })

      console.log('====================================================================')
      console.log(`[Database] Connected directly to MongoDB Atlas Cloud Cluster!`)
      console.log(`[Database] Cluster Host: ${conn.connection.host}`)
      console.log(`[Database] Target Database: ${conn.connection.name}`)
      console.log('====================================================================')
      return conn
    } catch (error) {
      console.error(`[Database Error] MongoDB Atlas connection failed: ${error.message}`)
      if (isAtlas) {
        throw new Error(`MongoDB Atlas connection error: ${error.message}`)
      }
    }
  }

  // Fallback to local MongoDB ONLY if no Atlas URI is configured
  try {
    const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/salonhub', {
      dbName: 'salonhub',
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`[Database] Connected to local MongoDB fallback: ${localConn.connection.host}/${localConn.connection.name}`)
    return localConn
  } catch (localErr) {
    console.error('[Database Fatal] Could not connect to MongoDB:', localErr.message)
    throw localErr
  }
}
