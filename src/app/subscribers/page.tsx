import { Pool } from 'pg';

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgres://neondb_owner:npg_sortKmDuU6g2@ep-royal-bar-a43ppf7m-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function getSubscribers(): Promise<Subscriber[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM subscribers');
    return result.rows;
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  } finally {
    client.release();
  }
}

export default async function SubscribersPage() {
  const subscribers: Subscriber[] = await getSubscribers();

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl text-teal-800 text-center mb-6">
          Trovia.ng Waitlist Subscribers
        </h1>
        {subscribers.length === 0 ? (
          <p className="text-gray-700 text-center text-base md:text-lg">
            No subscribers yet. Keep spreading the word! 🚀
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700 text-sm md:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 border-b border-gray-200">ID</th>
                  <th className="p-3 border-b border-gray-200">Email</th>
                  <th className="p-3 border-b border-gray-200">Subscribed At</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-gray-200">
                    <td className="p-3">{subscriber.id}</td>
                    <td className="p-3 break-all">{subscriber.email}</td>
                    <td className="p-3">
                      {new Date(subscriber.subscribed_at).toLocaleString('en-US', { timeZone: 'Africa/Lagos' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="text-center text-gray-500 text-xs md:text-sm mt-6 border-t border-gray-200 pt-4">
          <p>© 2025 Trovia.ng. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}