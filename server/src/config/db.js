import mongoose from 'mongoose'

/**
 * Resolve target database name from environment variable, URI path, or environment defaults.
 */
export const resolveDatabaseName = (uri) => {
  if (process.env.MONGODB_DB_NAME && process.env.MONGODB_DB_NAME.trim()) {
    return process.env.MONGODB_DB_NAME.trim()
  }
  if (uri && typeof uri === 'string') {
    const match = uri.match(/(?:mongodb(?:\+srv)?:\/\/[^/]+\/)([^?/\s]+)/i)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  return process.env.NODE_ENV === 'production' ? 'salonhub' : 'salonhub_dev'
}

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI
  const isAtlas = primaryUri && (primaryUri.includes('mongodb+srv://') || primaryUri.includes('.mongodb.net'))
  const hasPlaceholder = primaryUri && primaryUri.includes('<') && primaryUri.includes('>')
  const isProduction = process.env.NODE_ENV === 'production'

  // Resolve target database name for the active environment
  const targetDbName = resolveDatabaseName(primaryUri)

  // Safety Assertion: In local development, verify that resolved database is exactly 'salonhub_dev'
  // Abort startup immediately rather than allowing accidental connection to production 'salonhub'
  if (!isProduction) {
    if (targetDbName !== 'salonhub_dev') {
      const abortMsg = `[Database Safety Abort] Local development must connect to 'salonhub_dev', but resolved database name is '${targetDbName}'. Refusing connection to protect production database.`
      console.error('\n' + '='.repeat(70))
      console.error(abortMsg)
      console.error('='.repeat(70) + '\n')
      throw new Error(abortMsg)
    }
  }

  // If URI has placeholder like <db_password>, inform the developer clearly
  if (hasPlaceholder) {
    console.warn('\n====================================================================')
    console.warn('[MongoDB Atlas Notice] MONGODB_URI contains unreplaced placeholder <db_password>.')
    console.warn('To connect to your live MongoDB Atlas cloud cluster:')
    console.warn('  1. Open server/.env')
    console.warn('  2. Replace <db_password> with your MongoDB database user password.')
    console.warn(`  3. Ensure database name is set: ...mongodb.net/${targetDbName}?retryWrites=true&w=majority`)
    console.warn(`Falling back to local MongoDB (mongodb://127.0.0.1:27017/${targetDbName}) for now...`)
    console.warn('====================================================================\n')
  }

  // Attempt primary Atlas connection if configured
  if (primaryUri && !hasPlaceholder) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        dbName: targetDbName,
        serverSelectionTimeoutMS: 10000,
      })

      // Post-connection safety check for local development
      if (!isProduction && conn.connection.name !== 'salonhub_dev') {
        await mongoose.disconnect()
        throw new Error(
          `[Database Safety Abort] Connected database name '${conn.connection.name}' is not 'salonhub_dev'. Disconnected immediately for safety.`
        )
      }

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
    const fallbackDb = targetDbName || (isProduction ? 'salonhub' : 'salonhub_dev')
    const localConn = await mongoose.connect(`mongodb://127.0.0.1:27017/${fallbackDb}`, {
      dbName: fallbackDb,
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`[Database] Connected to local MongoDB fallback: ${localConn.connection.host}/${localConn.connection.name}`)
    return localConn
  } catch (localErr) {
    console.error('[Database Fatal] Could not connect to MongoDB:', localErr.message)
    throw localErr
  }
}
