import logging
from typing import Any, Dict, List, Optional
from neo4j import GraphDatabase, Driver
from app.config import settings

logger = logging.getLogger(__name__)

class Neo4jClient:
    def __init__(self):
        self._driver: Optional[Driver] = None
        self._available: bool = False

    def connect(self):
        if not settings.NEO4J_ENABLED:
            logger.info("Neo4j is disabled via settings.")
            self._available = False
            return
            
        try:
            self._driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
                max_connection_lifetime=30 * 60,
                max_connection_pool_size=50,
                connection_acquisition_timeout=2.0
            )
            self._driver.verify_connectivity()
            self._available = True
            logger.info("Connected to Neo4j successfully.")
            self._create_constraints_and_indexes()
        except Exception as e:
            logger.warning(f"Neo4j connection failed: {e}. Running in graph fallback mode.")
            self._available = False

    def _create_constraints_and_indexes(self):
        """Ensure uniqueness constraints and indexes for Section 7 & 9."""
        if not self._available or not self._driver:
            return
            
        constraints = [
            "CREATE CONSTRAINT case_id_unique IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE",
            "CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE",
            "CREATE CONSTRAINT phone_id_unique IF NOT EXISTS FOR (ph:Phone) REQUIRE ph.id IS UNIQUE",
            "CREATE CONSTRAINT phone_val_index IF NOT EXISTS FOR (ph:Phone) REQUIRE ph.normalized_value IS NOT NULL",
            "CREATE CONSTRAINT vehicle_id_unique IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.id IS UNIQUE",
            "CREATE CONSTRAINT location_id_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE",
            "CREATE CONSTRAINT org_id_unique IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE",
            "CREATE CONSTRAINT bank_id_unique IF NOT EXISTS FOR (b:BankAccount) REQUIRE b.id IS UNIQUE",
            "CREATE CONSTRAINT upi_id_unique IF NOT EXISTS FOR (u:UPI) REQUIRE u.id IS UNIQUE",
            "CREATE CONSTRAINT email_id_unique IF NOT EXISTS FOR (e:Email) REQUIRE e.id IS UNIQUE",
            "CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (ev:Event) REQUIRE ev.id IS UNIQUE",
        ]
        
        with self._driver.session() as session:
            for c in constraints:
                try:
                    session.run(c)
                except Exception as e:
                    logger.debug(f"Constraint creation note: {e}")

    @property
    def is_available(self) -> bool:
        return self._available

    def run_query(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if not self._available or not self._driver:
            logger.warning("Neo4j query attempted while driver unavailable.")
            return []
            
        parameters = parameters or {}
        try:
            with self._driver.session() as session:
                result = session.run(query, parameters)
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Error executing Neo4j query: {e}")
            raise

    def close(self):
        if self._driver:
            self._driver.close()
            self._available = False

neo4j_client = Neo4jClient()
